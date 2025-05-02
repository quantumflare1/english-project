import { Level } from "../level.mjs";
import Vector from "../misc/vector.mjs";
import * as Event from "../event.mjs";
import config from "../../data/config/player.json" with { type: "json" };
import Rect from "./rect.mjs";
import AnimatedSprite from "./animated_sprite.mjs";
import Entity from "./entity.mjs";
import Assets from "../assets.mjs";
import { input, keybinds } from "../inputs.mjs";
import { convertToAnimSpriteList } from "../misc/util.mjs";
import sprite from "../../data/img/sprite/player.json";

const WIDTH = config.width;
const HEIGHT = config.height;
const ACCEL_TICKS = config.accelTime;
const MAX_VEL = config.maxVel;
const RUN_VEL = MAX_VEL * 0.7;
const DECEL_TICKS = config.decelTime;
const MAX_GRAPPLE_TICKS = config.maxGrappleTime;
const GRAPPLE_VEL = config.grappleVel;
const GRAPPLE_FREEZE_TICKS = config.grappleFreezeTime;
const GRAPPLE_OFFSET = new Vector(config.grappleOffsetX, config.grappleOffsetY);
const GRAPPLE_RANGE = config.grappleRange;
const GRAPPLE_DEAD_ZONE = config.grappleDeadZone;
const JUMP_HEIGHT = config.jumpHeight;
const JUMP_TIME = config.jumpTime;
const TERMINAL_VEL = config.terminalVel;
const MIN_JUMP_FACTOR = config.minJumpFactor;
const AIR_ACCEL_FACTOR = config.airAccelFactor;
const AIR_DECEL_FACTOR = config.airDecelFactor;
const RESPAWN_TICKS = config.respawnTime;
const COYOTE_TICKS = config.coyoteTime;
const BUFFER_TICKS = config.bufferTime;
const TOUCH_THRESHOLD = 0.01;
const CAMERA_OFFSET = new Vector(-160 + config.width / 2, -90 + config.height / 2);

export default class Player extends Entity {
    static states = {
        DEFAULT: 0,
        INTRO: 1,
        GRAPPLED: 2
    };

    static #accelPerTick = MAX_VEL / ACCEL_TICKS;
    static #decelPerTick = MAX_VEL / DECEL_TICKS;
    static #gravity = (JUMP_HEIGHT * 2) / (JUMP_TIME ** 2);
    static #baseJumpVel = Math.sqrt(2 * this.#gravity * JUMP_HEIGHT);

    vel = new Vector();
    touching = new Map();
    jumpTimer = 20;
    jumpBufferTime = BUFFER_TICKS;
    grappleBufferTime = BUFFER_TICKS;
    coyoteTime = COYOTE_TICKS;
    facing = new Vector(1, 0);
    lastFacedX = 1;
    canGrapple = false;
    grappleTime = 0;
    grapple = new Vector();
    state = Player.states.DEFAULT;
    grappleStarted = false;
    inControl = true;
    isDead = false;
    respawnTime = RESPAWN_TICKS;
    temp; spawnX; spawnY; level;
    z;

    /**
     * Finds the nearest tile in the direction the player is facing
     * @param {Vector} s The starting position of the ray
     * @param {Vector} d The direction of the ray
     * @returns A vector to the tile hit
     */
    #raycast(s, d) {
        // note: diagonal grapples currently bugged
        let pos = new Vector(s.x / 10, s.y / 10);
        const step = Math.abs(d.x) > Math.abs(d.y) ? Math.abs(d.x) : Math.abs(d.y);
        const delta = new Vector(d.x / step, d.y / step);

        // compensate for room pos offset
        pos.subtract(this.level.rooms[this.level.curRoom].pos);
        if (pos.y >= this.level.rooms[this.level.curRoom].dimensions.y || pos.y < 0 || pos.x >= this.level.rooms[this.level.curRoom].dimensions.x || pos.x < 0) {
            return null;
        }
        while (this.level.roomBlocks[this.level.curRoom][Math.floor(pos.y)][Math.floor(pos.x)] === 0) {
            pos.add(delta);
    
            if (pos.y >= this.level.rooms[this.level.curRoom].dimensions.y || pos.y < 0 || pos.x >= this.level.rooms[this.level.curRoom].dimensions.x || pos.x < 0) {
                return null;
            }
        }
    
        if (d.x > 0) pos.x = Math.floor(pos.x);
        if (d.x < 0) pos.x = Math.ceil(pos.x);
        if (d.y > 0) pos.y = Math.floor(pos.y);
        if (d.y < 0) pos.y = Math.ceil(pos.y);
    
        pos.add(this.level.rooms[this.level.curRoom].pos);
        pos.multiply(10);
    
        const rayLength = Math.sqrt((pos.y-s.y) ** 2 + (pos.x-s.x) ** 2);
        if (rayLength < GRAPPLE_DEAD_ZONE || rayLength > GRAPPLE_RANGE) {
            return null;
        }
        return pos;
    }

    /**
     * Creates a new player
     * @param {number} x The X coordinate of the player
     * @param {number} y The Y coordinate of the player
     * @param {Level} level The level this player is in. 
     */
    constructor(x, y, level) {
        const texDetails = Assets.sprites.player.sprite;
        super(x, y, new Rect(x, y, WIDTH, HEIGHT),
        new AnimatedSprite(x + sprite.sprite[0][4], y + sprite.sprite[0][5], 0,
            convertToAnimSpriteList(texDetails),
        0, 8));
        this.spawnX = x;
        this.spawnY = y;
        this.level = level;
        this.temp = this.#raycast(this.pos, this.facing);

        this.touching.set("down", false);
        this.touching.set("up", false);
        this.touching.set("left", false);
        this.touching.set("right", false);

        dispatchEvent(new Event.CameraSnapEvent(this.pos.x + CAMERA_OFFSET.x, this.pos.y + CAMERA_OFFSET.y));
    }
    update() {
        if (this.isDead) {
            this.respawnTime--;
            this.vel.zero();
            if (this.respawnTime <= 0) {
                this.isDead = false;
                super.update(new Vector(-this.pos.x + this.spawnX, -this.pos.y + this.spawnY));
                this.jumpBufferTime = 0;
                this.coyoteTime = 0;
                this.respawnTime = RESPAWN_TICKS;
                dispatchEvent(new Event.CameraSnapEvent(this.pos.x + CAMERA_OFFSET.x, this.pos.y + CAMERA_OFFSET.y));
            }
            return;
        }

        if (!this.touching.get("down")) {
            if (this.vel.y < TERMINAL_VEL)
                this.vel.y += Player.#gravity;

            if (this.grappleTime === 0) this.coyoteTime--;
        } else {
            this.vel.y = 0;
            this.coyoteTime = COYOTE_TICKS;
            if (this.grappleTime === 0) this.canGrapple = true;
        }

        this.findFacingDirection();
        this.processGrapple();

        if (this.touching.get("right") || this.touching.get("left"))
            this.vel.x = 0;

        this.changeRoom();

        this.processJump();
        this.processRun();

        if (this.grappleTime > 0) {
            if (this.grapple !== null) {
                this.vel.x = this.grapple.x;
                this.vel.y = this.grapple.y;
            }
            this.grappleTime--;
            this.coyoteTime = COYOTE_TICKS;
        }

        this.prevX = this.pos.x;
        this.prevY = this.pos.y;

        this.setSprite();
        super.update(this.vel);
        dispatchEvent(new Event.CameraMoveEvent(this.pos.x + CAMERA_OFFSET.x, this.pos.y + CAMERA_OFFSET.y));

        this.collide();

        //this.x = Math.round(this.x);
        //this.y = Math.round(this.y);
    }
    findFacingDirection() {
        if (input.continuous.has(keybinds.right)) {
            this.facing.x = 1;
            this.lastFacedX = 1;
        }
        else if (input.continuous.has(keybinds.left)) {
            this.facing.x = -1;
            this.lastFacedX = -1;
        }
        else {
            this.facing.x = 0;
        }

        if (input.continuous.has(keybinds.down))
            this.facing.y = 1;
        else if (input.continuous.has(keybinds.up))
            this.facing.y = -1;
        else
            this.facing.y = 0;

        if (this.facing.x === 0 && this.facing.y === 0)
            this.facing.x = this.lastFacedX;
    }
    changeRoom() {
        const roomDimensions = new Vector(this.level.rooms[this.level.curRoom].dimensions.x, this.level.rooms[this.level.curRoom].dimensions.y);
        const roomPos = new Vector(this.level.rooms[this.level.curRoom].pos.x, this.level.rooms[this.level.curRoom].pos.y);
        roomDimensions.multiply(10);
        roomPos.multiply(10);

        if (this.level.rooms[this.level.curRoom].right && this.pos.x > roomDimensions.x - WIDTH/2 + roomPos.x) {
            const nextRoom = this.level.rooms[this.level.curRoom].right;
            //super.update(new Vector(-(this.pos.x + WIDTH/2), 0));
            //this.pos.x = -WIDTH/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("right"));
        }
        // stop player from going offscreen
        if (this.level.rooms[this.level.curRoom].left && this.pos.x < -WIDTH/2 + roomPos.x) {
            const nextRoom = this.level.rooms[this.level.curRoom].left;
            //super.update(new Vector(nextRoom.dimensions.x * 10, 0));
            //this.pos.x = nextRoom.width * 10 - WIDTH/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("left"));
        }
        if (this.level.rooms[this.level.curRoom].down && this.pos.x > roomDimensions.y - HEIGHT/2 + roomPos.y) {
            const nextRoom = this.level.rooms[this.level.curRoom].down;
            //super.update(new Vector(0, -(this.pos.y + HEIGHT/2)));
            //this.pos.y = -HEIGHT/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("down"));
        }
        if (this.level.rooms[this.level.curRoom].up && this.pos.x < -HEIGHT/2 + roomPos.y) {
            const nextRoom = this.level.rooms[this.level.curRoom].up;
            //super.update(new Vector(0, nextRoom.dimensions.y * 10));
            //this.pos.y = nextRoom.width * 10 - HEIGHT/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("up"));
        }
    }
    processRun() {
        const acceleration = this.touching.get("down") ? Player.#accelPerTick : Player.#accelPerTick * AIR_ACCEL_FACTOR;
        const deceleration = this.touching.get("down") ? Player.#decelPerTick : Player.#decelPerTick * AIR_DECEL_FACTOR;
        if (input.continuous.has(keybinds.right) && !this.touching.get("right")) {
            if (this.vel.x < MAX_VEL)
                this.vel.x += acceleration;
            else if (this.vel.x > MAX_VEL) {
                this.vel.x -= deceleration;
                if (this.vel.x < 0.05)
                    this.vel.x = 0;
            }
        } else if (this.vel.x > 0) {
            this.vel.x -= deceleration;
            if (this.vel.x < 0.05)
                this.vel.x = 0;
        }
        if (input.continuous.has(keybinds.left) && !this.touching.get("left")) {
            if (this.vel.x > -MAX_VEL)
                this.vel.x -= acceleration;
            else if (this.vel.x < -MAX_VEL) {
                this.vel.x += deceleration;
                if (this.vel.x > -0.05)
                    this.vel.x = 0;
            }
        } else if (this.vel.x < 0) {
            this.vel.x += deceleration;
            if (this.vel.x > -0.05)
                this.vel.x = 0;
        }
    }
    processGrapple() {
        if (input.continuous.has(keybinds.grapple)) {
            this.grappleBufferTime--;
        } else {
            this.grappleBufferTime = BUFFER_TICKS;
            this.grappleTime = 0;
        }

        if (this.grappleStarted) {
            this.temp = this.#raycast(new Vector(this.pos.x + GRAPPLE_OFFSET.x, this.pos.y + GRAPPLE_OFFSET.y), this.facing);
            this.grappleStarted = false;
            
            if (this.temp) {
                this.grapple = this.facing.normalize();
                this.grapple.multiply(GRAPPLE_VEL);
            }
            else {
                this.grapple = null;
            }

            if (this.temp) {
                this.canGrapple = false;
                this.grappleBufferTime = 0;
                this.grappleTime = MAX_GRAPPLE_TICKS;
            }
        }

        if (this.grappleBufferTime > 0 && this.canGrapple && input.impulse.has(keybinds.grapple) && !this.grappleStarted) { // start grapple
            input.consumeInput(keybinds.grapple);
            this.grappleStarted = true;
            this.grappleBufferTime = 0;
            const ev = new CustomEvent("game_freezetime", { detail: GRAPPLE_FREEZE_TICKS });
            dispatchEvent(ev);
        }
    }
    processJump() {
        if (input.impulse.has(keybinds.jump)) // press jump
            this.jumpBufferTime--;
        else // release jump
            this.jumpBufferTime = BUFFER_TICKS;
        
        if (!input.impulse.has(keybinds.jump) && this.vel.y < 0)
            if (this.vel.y < -Player.#baseJumpVel * MIN_JUMP_FACTOR)
                this.vel.y = -Player.#baseJumpVel * MIN_JUMP_FACTOR;

        if (this.jumpBufferTime >= 0 && this.coyoteTime >= 0 && input.impulse.has(keybinds.jump)) { // start jump
            input.consumeInput(keybinds.grapple);
            this.vel.y = -Player.#baseJumpVel;
            this.jumpTimer = 10;
            this.coyoteTime = 0;
            this.grappleTime = 0;
            this.jumpBufferTime = 0;
        }
    }
    setSprite() {
        if (input.continuous.has(keybinds.left) && this.vel.x > 0 || input.continuous.has(keybinds.right) && this.vel.x < 0) {
            this.sprite.setStartFrame(sprite.name.turning);
            this.sprite.setEndFrame(sprite.name.turning);
        }
        else if (input.continuous.has(keybinds.right) && this.vel.x >= RUN_VEL) {
            this.sprite.setStartFrame(sprite.name.run_right1);
            this.sprite.setEndFrame(sprite.name.run_right2);
        }
        else if (input.continuous.has(keybinds.right)) {
            this.sprite.setStartFrame(sprite.name.walk_right1);
            this.sprite.setEndFrame(sprite.name.walk_right2);
        }
        else if (input.continuous.has(keybinds.left) && this.vel.x <= -RUN_VEL) {
            this.sprite.setStartFrame(sprite.name.run_left1);
            this.sprite.setEndFrame(sprite.name.run_left2);
        }
        else if (input.continuous.has(keybinds.left)) {
            this.sprite.setStartFrame(sprite.name.walk_left1);
            this.sprite.setEndFrame(sprite.name.walk_left2);
        }
        else if (this.facing.x < 0) {
            this.sprite.setStartFrame(sprite.name.facing_left);
            this.sprite.setEndFrame(sprite.name.facing_left);
        }
        else {
            this.sprite.setStartFrame(sprite.name.facing_right);
            this.sprite.setEndFrame(sprite.name.facing_right);
        }
    }
    collide() {
        let moveX = this.pos.x - this.prevX;
        let moveY = this.pos.y - this.prevY;

        this.touching.set("down", false);
        this.touching.set("left", false);
        this.touching.set("right", false);
        this.touching.set("up", false);

        // broad phase
        const overlappingTiles = [];

        for (const i of this.level.blockList) 
            if (this.hitbox.collidesWith(i))
                overlappingTiles.push(i);

        // narrow phase
        for (const i of overlappingTiles) {
            if (!this.hitbox.collidesWith(i))
                    continue;

            let kickX, kickY;

            if (moveX > 0) kickX = i.pos.x - (this.pos.x + WIDTH);
            else if (moveX < 0) kickX = (i.pos.x + i.dimensions.x) - this.pos.x;
            if (moveY > 0) kickY = i.pos.y - (this.pos.y + HEIGHT);
            else if (moveY < 0) kickY = (i.pos.y + i.dimensions.x) - this.pos.y; // no clue if this should be i.pos.y + i.dimensions.y

            if (!kickX && kickY) {
                super.update(new Vector(0, kickY));
                moveY -= kickY;
            }
            if (!kickY && kickX) {
                super.update(new Vector(kickX, 0));
                moveX -= kickX;
            }

            const kickXPercent = kickX / moveX;
            const kickYPercent = kickY / moveY;
            
            if (kickX && kickY) {
                if (Math.abs(kickXPercent) < Math.abs(kickYPercent)) { // kick x axis mostly
                    super.update(new Vector(kickX, 0));
                }
                else { // kick y axis mostly
                    super.update(new Vector(0, kickY));
                }
            }
            this.grappleTime = 0;
        }

        for (const i of this.level.hazardList) {
            if (this.hitbox.collidesWith(i)) {
                if (i.facing === "up" && this.vel.y < 0) continue;
                if (i.facing === "down" && this.vel.y > 0) continue;
                if (i.facing === "left" && this.vel.x < 0) continue;
                if (i.facing === "right" && this.vel.x > 0) continue;

                this.isDead = true;
            }
        }

        const touchingTiles = [];
        for (const i of this.level.blockList) {
            if (i.id !== 0 &&
                this.pos.x + WIDTH + TOUCH_THRESHOLD >= i.pos.x &&
                this.pos.x <= i.pos.x + i.dimensions.x + TOUCH_THRESHOLD &&
                this.pos.y + HEIGHT + TOUCH_THRESHOLD >= i.pos.y &&
                this.pos.y <= i.pos.y + i.dimensions.y + TOUCH_THRESHOLD)
                    touchingTiles.push(i);
        }

        for (const i of touchingTiles) {
            if (this.pos.x + WIDTH + TOUCH_THRESHOLD > i.pos.x &&
                this.pos.x + TOUCH_THRESHOLD < i.pos.x + i.dimensions.x &&
                this.pos.y + HEIGHT > i.pos.y &&
                this.pos.y < i.pos.y + i.dimensions.y && this.vel.x >= 0)
                    this.touching.set("right", true);
            if (this.pos.x + WIDTH - TOUCH_THRESHOLD > i.pos.x &&
                this.pos.x - TOUCH_THRESHOLD < i.pos.x + i.dimensions.x &&
                this.pos.y + HEIGHT > i.pos.y &&
                this.pos.y < i.pos.y + i.dimensions.y && this.vel.x <= 0)
                    this.touching.set("left", true);
            if (this.pos.x + WIDTH > i.pos.x &&
                this.pos.x < i.pos.x + i.dimensions.x &&
                this.pos.y + HEIGHT + TOUCH_THRESHOLD > i.pos.y &&
                this.pos.y + TOUCH_THRESHOLD < i.pos.y + i.dimensions.y && this.vel.y >= 0)
                    this.touching.set("down", true);
            if (this.pos.x + WIDTH > i.pos.x &&
                this.pos.x < i.pos.x + i.dimensions.x &&
                this.pos.y + HEIGHT - TOUCH_THRESHOLD > i.pos.y &&
                this.pos.y - TOUCH_THRESHOLD < i.pos.y + i.dimensions.y && this.vel.y <= 0)
                    this.touching.set("up", true);
        }

        if (this.touching.get("up")) this.vel.y = 0;
    }
}
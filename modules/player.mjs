import * as Thing from "./thing.mjs";
import * as Level from "./level.mjs";
import Vector from "./misc/vector.mjs"
import * as Event from "./event.mjs";
import config from "../data/config/player.json" with { type: "json" };

const WIDTH = config.width;
const HEIGHT = config.height;
const ACCEL_TICKS = config.accelTime;
const MAX_VEL = config.maxVel;
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

export default class Player extends Thing.Entity {
    static state = {
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
    inputs = new Set();
    jumpTimer = 20;
    jumpBufferTime = BUFFER_TICKS;
    grappleBufferTime = BUFFER_TICKS;
    coyoteTime = COYOTE_TICKS;
    facing = new Vector(1, 0);
    lastFacedX = 1;
    canGrapple = false;
    grappleTime = 0;
    grapple = new Vector();
    state = Player.state.DEFAULT;
    grappleStarted = false;
    inControl = true;
    isDead = false;
    respawnTime = RESPAWN_TICKS;
    temp; spawnX; spawnY; level;

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

        if (pos.y >= this.level.rooms[this.level.curRoom].height || pos.y < 0 || pos.x >= this.level.rooms[this.level.curRoom].width || pos.x < 0) {
            return null;
        }
        while (this.level.rooms[this.level.curRoom].rawTiles[Math.floor(pos.y)][Math.floor(pos.x)] === 0) {
            pos.x += delta.x;
            pos.y += delta.y;
    
            if (pos.y >= this.level.rooms[this.level.curRoom].height || pos.y < 0 || pos.x >= this.level.rooms[this.level.curRoom].width || pos.x < 0) {
                return null;
            }
        }
    
        if (d.x > 0) pos.x = Math.floor(pos.x);
        if (d.x < 0) pos.x = Math.ceil(pos.x);
        if (d.y > 0) pos.y = Math.floor(pos.y);
        if (d.y < 0) pos.y = Math.ceil(pos.y);
    
        pos.x *= 10;
        pos.y *= 10;
    
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
     * @param {Level.Level} level The level this player is in. 
     */
    constructor(x, y, level) {
        super(x, y, WIDTH, HEIGHT, config.spriteSrc, -1, new Thing.SpriteConfig(...config.sprite));
        this.spawnX = x;
        this.spawnY = y;
        this.level = level;
        this.temp = this.#raycast(new Vector(x, y), this.facing);

        this.touching.set("down", false);
        this.touching.set("up", false);
        this.touching.set("left", false);
        this.touching.set("right", false);

        dispatchEvent(new Event.CameraMoveEvent(this.x + CAMERA_OFFSET.x, this.y + CAMERA_OFFSET.y, true));

        addEventListener("keydown", this.keydown);
        addEventListener("keyup", this.keyup);
    }
    keydown = (e) => this.inputs.add(e.key.toLowerCase());
    keyup = (e) => this.inputs.delete(e.key.toLowerCase());
    tick() {
        if (this.isDead) {
            this.respawnTime--;
            this.vel.zero();
            if (this.respawnTime <= 0) {
                this.isDead = false;
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.jumpBufferTime = 0;
                this.coyoteTime = 0;
                this.respawnTime = RESPAWN_TICKS;
                dispatchEvent(new Event.CameraMoveEvent(this.x + CAMERA_OFFSET.x, this.y + CAMERA_OFFSET.y, true));
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

        // DEBUG
        if (this.inputs.has("t")) {
            console.log(this.touching)
            console.log(this.x, this.y);
        }

        if (this.grappleTime > 0) {
            if (this.grapple !== null) {
                this.vel.x = this.grapple.x;
                this.vel.y = this.grapple.y;
            }
            this.grappleTime--;
            this.coyoteTime = COYOTE_TICKS;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.vel.x;
        this.y += this.vel.y;

        dispatchEvent(new Event.CameraMoveEvent(this.x + CAMERA_OFFSET.x, this.y + CAMERA_OFFSET.y));

        this.collide();

        //this.x = Math.round(this.x);
        //this.y = Math.round(this.y);
    }
    findFacingDirection() {
        if (this.inputs.has("arrowright")) {
            this.facing.x = 1;
            this.lastFacedX = 1;
        }
        else if (this.inputs.has("arrowleft")) {
            this.facing.x = -1;
            this.lastFacedX = -1;
        }
        else {
            this.facing.x = 0;
        }

        if (this.inputs.has("arrowdown"))
            this.facing.y = 1;
        else if (this.inputs.has("arrowup"))
            this.facing.y = -1;
        else
            this.facing.y = 0;

        if (this.facing.x === 0 && this.facing.y === 0)
            this.facing.x = this.lastFacedX;
    }
    changeRoom() {
        if (this.level.rooms[this.level.curRoom].right && this.x > this.level.rooms[this.level.curRoom].width * 10 - WIDTH/2) {
            const nextRoom = this.level.rooms[this.level.curRoom].right;
            this.x = -WIDTH/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("right"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
        // stop player from going offscreen
        if (this.level.rooms[this.level.curRoom].left && this.x < -WIDTH/2) {
            const nextRoom = this.level.rooms[this.level.curRoom].left;
            this.x = nextRoom.width * 10 - WIDTH/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("left"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
        if (this.level.rooms[this.level.curRoom].down && this.x > this.level.rooms[this.level.curRoom].height * 10 - HEIGHT/2) {
            const nextRoom = this.level.rooms[this.level.curRoom].down;
            this.y = -HEIGHT/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("down"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
        if (this.level.rooms[this.level.curRoom].up && this.x < -HEIGHT/2) {
            const nextRoom = this.level.rooms[this.level.curRoom].up;
            this.y = nextRoom.width * 10 - HEIGHT/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("up"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
    }
    processRun() {
        const acceleration = this.touching.get("down") ? Player.#accelPerTick : Player.#accelPerTick * AIR_ACCEL_FACTOR;
        const deceleration = this.touching.get("down") ? Player.#decelPerTick : Player.#decelPerTick * AIR_DECEL_FACTOR;
        if (this.inputs.has("arrowright") && !this.touching.get("right")) {
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
        if (this.inputs.has("arrowleft") && !this.touching.get("left")) {
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
        if (this.inputs.has("z")) {
            this.grappleBufferTime--;
        } else {
            this.grappleBufferTime = BUFFER_TICKS;
            this.grappleTime = 0;
        }

        if (this.grappleStarted) {
            this.temp = this.#raycast(new Vector(this.x + GRAPPLE_OFFSET.x, this.y + GRAPPLE_OFFSET.y), this.facing);
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

        if (this.grappleBufferTime > 0 && this.canGrapple && this.inputs.has("z") && !this.grappleStarted) { // start grapple
            this.grappleStarted = true;
            this.grappleBufferTime = 0;
            const ev = new CustomEvent("game_freezetime", { detail: GRAPPLE_FREEZE_TICKS });
            dispatchEvent(ev);
        }
    }
    processJump() {
        if (this.inputs.has(" ")) // press jump
            this.jumpBufferTime--;
        else // release jump
            this.jumpBufferTime = BUFFER_TICKS;
        
        if (!this.inputs.has(" ") && this.vel.y < 0)
            if (this.vel.y < -Player.#baseJumpVel * MIN_JUMP_FACTOR)
                this.vel.y = -Player.#baseJumpVel * MIN_JUMP_FACTOR;

        if (this.jumpBufferTime >= 0 && this.coyoteTime >= 0 && this.inputs.has(" ")) { // start jump
            this.vel.y = -Player.#baseJumpVel;
            this.jumpTimer = 10;
            this.coyoteTime = 0;
            this.grappleTime = 0;
            this.jumpBufferTime = 0;
        }
    }
    collide() {
        let moveX = this.x - this.prevX;
        let moveY = this.y - this.prevY;

        this.touching.set("down", false);
        this.touching.set("left", false);
        this.touching.set("right", false);
        this.touching.set("up", false);

        // broad phase
        const overlappingTiles = [];

        for (const i of this.level.rooms[this.level.curRoom].tiles)
            if (this.x + WIDTH > i.x && this.x < i.x + i.width && this.y + HEIGHT > i.y && this.y < i.y + i.height)
                overlappingTiles.push(i);

        // narrow phase
        for (const i of overlappingTiles) {
            if (!(this.x + WIDTH > i.x &&
                this.x < i.x + i.width &&
                this.y + HEIGHT > i.y &&
                this.y < i.y + i.height))
                    continue;

            let kickX, kickY;

            if (moveX > 0) kickX = i.x - (this.x + WIDTH);
            else if (moveX < 0) kickX = (i.x + i.width) - this.x;
            if (moveY > 0) kickY = i.y - (this.y + HEIGHT);
            else if (moveY < 0) kickY = (i.y + i.width) - this.y;

            if (!kickX && kickY) {
                this.y += kickY;
                moveY -= kickY;
            }
            if (!kickY && kickX) {
                this.x += kickX;
                moveX -= kickX;
            }

            const kickXPercent = kickX / moveX;
            const kickYPercent = kickY / moveY;
            
            if (kickX && kickY) {
                if (Math.abs(kickXPercent) < Math.abs(kickYPercent)) { // kick x axis mostly
                    this.x += kickX;
                    moveX -= kickX;
                }
                else { // kick y axis mostly
                    this.y += kickY;
                    moveY -= kickY;
                }
            }
            this.grappleTime = 0;
        }
        for (const i of this.level.rooms[this.level.curRoom].hazards) {
            if (this.x + WIDTH > i.x &&
                this.x < i.x + i.width &&
                this.y + HEIGHT > i.y &&
                this.y < i.y + i.height) {
                    if (i.facing === "up" && this.vel.y < 0) continue;
                    if (i.facing === "down" && this.vel.y > 0) continue;
                    if (i.facing === "right" && this.vel.x < 0) continue;
                    if (i.facing === "left" && this.vel.x > 0) continue;

                    this.isDead = true;
            }
        }

        const touchingTiles = [];
        for (const i of this.level.rooms[this.level.curRoom].tiles) {
            if (i.id !== 0 &&
                this.x + WIDTH + TOUCH_THRESHOLD >= i.x &&
                this.x <= i.x + i.width + TOUCH_THRESHOLD &&
                this.y + HEIGHT + TOUCH_THRESHOLD >= i.y &&
                this.y <= i.y + i.height + TOUCH_THRESHOLD)
                    touchingTiles.push(i);
        }

        for (const i of touchingTiles) {
            if (this.x + WIDTH + TOUCH_THRESHOLD > i.x &&
                this.x + TOUCH_THRESHOLD < i.x + i.width &&
                this.y + HEIGHT > i.y &&
                this.y < i.y + i.height && this.vel.x >= 0)
                    this.touching.set("right", true);
            if (this.x + WIDTH - TOUCH_THRESHOLD > i.x &&
                this.x - TOUCH_THRESHOLD < i.x + i.width &&
                this.y + HEIGHT > i.y &&
                this.y < i.y + i.height && this.vel.x <= 0)
                    this.touching.set("left", true);
            if (this.x + WIDTH > i.x &&
                this.x < i.x + i.width &&
                this.y + HEIGHT + TOUCH_THRESHOLD > i.y &&
                this.y + TOUCH_THRESHOLD < i.y + i.height && this.vel.y >= 0)
                    this.touching.set("down", true);
            if (this.x + WIDTH > i.x &&
                this.x < i.x + i.width &&
                this.y + HEIGHT - TOUCH_THRESHOLD > i.y &&
                this.y - TOUCH_THRESHOLD < i.y + i.height && this.vel.y <= 0)
                    this.touching.set("up", true);
        }

        if (this.touching.get("up")) this.vel.y = 0;
    }
}
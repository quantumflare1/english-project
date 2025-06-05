import { Level } from "../level.mjs";
import Vector from "../misc/vector.mjs";
import { CameraMoveEvent, CameraSnapEvent, PlayerFreezeEvent, PlayerStateChangeEvent, PlayerUnfreezeEvent, RoomChangeEvent } from "../event.mjs";
import config from "../../data/config/player.json" with { type: "json" };
import Rect from "./rect.mjs";
import { convertToAnimSpriteList } from "../misc/util.mjs";
import Entity from "./entity.mjs";
import Assets from "../assets.mjs";
import { input, keybinds } from "../inputs.mjs";
import AnimatedSprite from "./animated_sprite.mjs";

import sprite from "../../data/img/sprite/ophelia.json" with { type: "json" };

const WIDTH = config.width;
const HEIGHT = config.height;
const MAX_VEL = config.maxVel;
const TOUCH_THRESHOLD = 0.01;
const CAMERA_OFFSET = new Vector(-160 + config.width / 2, -90 + config.height / 2);

export default class Player extends Entity {
    vel = new Vector();
    touching = new Map();
    facing = new Vector(1, 0);
    inControl = true;
    spawnX; spawnY; level;
    facing = new Vector(0, 1);
    z = 0;

    /**
     * Creates a new player
     * @param {number} x The X coordinate of the player
     * @param {number} y The Y coordinate of the player
     * @param {Level} level The level this player is in. 
     */
    constructor(x, y, level) {
        const texDetails = Assets.sprites.ophelia.sprite;
        super(x, y, new Rect(x, y, WIDTH, HEIGHT),
        new AnimatedSprite(x + texDetails[0][4], y + texDetails[0][5], 0,
            convertToAnimSpriteList(texDetails),
        0, 8));
        this.spawnX = x;
        this.spawnY = y;
        this.level = level;

        this.touching.set("down", false);
        this.touching.set("up", false);
        this.touching.set("left", false);
        this.touching.set("right", false);

        dispatchEvent(new CameraSnapEvent(this.pos.x + CAMERA_OFFSET.x, this.pos.y + CAMERA_OFFSET.y));

        addEventListener(PlayerStateChangeEvent.code, (e) => {
            this.state = e.detail;
        });
        addEventListener(PlayerFreezeEvent.code, () => {
            this.inControl = false;
        })
        addEventListener(PlayerUnfreezeEvent.code, () => {
            this.inControl = true;
        })
    }
    update() {
        this.findFacingDirection();
        this.changeRoom();
        this.processRun();

        this.prevX = this.pos.x;
        this.prevY = this.pos.y;

        this.setSprite();
        super.move(this.vel);
        dispatchEvent(new CameraMoveEvent(this.pos.x + CAMERA_OFFSET.x, this.pos.y + CAMERA_OFFSET.y));

        this.collide();
    }
    findFacingDirection() {
        if (!this.inControl)
            return;
        
        if (input.continuous.has(keybinds.right)) {
            this.facing.x = 1;
        }
        else if (input.continuous.has(keybinds.left)) {
            this.facing.x = -1;
        }
        else if (input.continuous.has(keybinds.down)) {
            this.facing.y = 1;
        }
        else if (input.continuous.has(keybinds.up)) {
            this.facing.y = -1;
        }
    }
    changeRoom() {
        const roomDimensions = new Vector(this.level.rooms[this.level.curRoom].dimensions.x, this.level.rooms[this.level.curRoom].dimensions.y);
        const roomPos = new Vector(this.level.rooms[this.level.curRoom].pos.x, this.level.rooms[this.level.curRoom].pos.y);
        roomDimensions.multiply(40);
        roomPos.multiply(40);

        if (this.pos.x > roomDimensions.x - WIDTH/2 + roomPos.x)
            for (const i of this.level.rooms[this.level.curRoom].right)
                if (this.pos.y >= i.lower && this.pos.y + HEIGHT <= i.upper)
                    dispatchEvent(new RoomChangeEvent(i.room));
        if (this.pos.x < -WIDTH/2 + roomPos.x)
            for (const i of this.level.rooms[this.level.curRoom].left)
                if (this.pos.y >= i.lower && this.pos.y + HEIGHT <= i.upper)
                    dispatchEvent(new RoomChangeEvent(i.room));
        if (this.pos.y > roomDimensions.y - HEIGHT/2 + roomPos.y)
            for (const i of this.level.rooms[this.level.curRoom].down)
                if (this.pos.x >= i.lower && this.pos.x + WIDTH <= i.upper)
                    dispatchEvent(new RoomChangeEvent(i.room));
        if (this.pos.y < -HEIGHT/2 + roomPos.y)
            for (const i of this.level.rooms[this.level.curRoom].up)
                if (this.pos.x >= i.lower && this.pos.x + WIDTH <= i.upper)
                    dispatchEvent(new RoomChangeEvent(i.room));
    }
    processRun() {
        if (input.continuous.has(keybinds.left) && !this.touching.get("left") && this.inControl) {
            this.vel.x = -MAX_VEL;
        }
        else if (input.continuous.has(keybinds.right) && !this.touching.get("right") && this.inControl) {
            this.vel.x = MAX_VEL;
        }
        else {
            this.vel.x = 0;
        }
        if (input.continuous.has(keybinds.up) && !this.touching.get("up") && this.inControl) {
            this.vel.y = -MAX_VEL;
        }
        else if (input.continuous.has(keybinds.down) && !this.touching.get("down") && this.inControl) {
            this.vel.y = MAX_VEL;
        }
        else {
            this.vel.y = 0;
        }
    }
    setSprite() {
        if (this.facing.y < 0) {
            this.sprite.setStartFrame(sprite.name.up);
            this.sprite.setEndFrame(sprite.name.up);
        }
        else {
            this.sprite.setStartFrame(sprite.name.down);
            this.sprite.setEndFrame(sprite.name.down);
        }
        this.sprite.update();
    }
    collide() {
        let moveX = this.pos.x - this.prevX;
        let moveY = this.pos.y - this.prevY;

        this.touching.set("down", false);
        this.touching.set("left", false);
        this.touching.set("right", false);
        this.touching.set("up", false);

        // probably should move this to trigger class
        for (const i of this.level.triggerList) {
            if (this.hitbox.collidesWith(i)) {
                if (!i.disabled && !i.done) {
                    i.ontouch(this);
                    i.disabled = true;
                }
                if (!i.done && input.impulse.has(keybinds.select)) {
                    input.consumeInput(keybinds.select);

                    i.oninteract(this);
                }
            }
            else {
                i.disabled = false;
            }
        }
        for (const i of this.level.specialList) {
            if (this.hitbox.collidesWith(i.hitbox)) {
                if (!i.disabled && !i.done) {
                    i.ontouch(this);
                    i.disabled = true;
                }
            }
            else {
                i.disabled = false;
            }
        }

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
            else if (moveY < 0) kickY = (i.pos.y + i.dimensions.y) - this.pos.y; // no clue if this should be i.pos.y + i.dimensions.y

            const kickXVec = new Vector(kickX);
            const kickYVec = new Vector(0, kickY);

            switch (i.blockDir) {
                case "down":
                    // only collide IF: player is moving vertically downward and was above the platform last tick
                    if (kickY && kickY < 0 && this.prevY + this.hitbox.dimensions.y < i.pos.y) {
                        super.move(kickYVec);
                        moveY -= kickY;
                    }
                    continue;
                // add other cases later
            }

            if (!kickX && kickY) {
                super.move(kickYVec);
                moveY -= kickY;
            }
            if (!kickY && kickX) {
                super.move(kickXVec);
                moveX -= kickX;
            }

            const kickXPercent = kickX / moveX;
            const kickYPercent = kickY / moveY;
            
            if (kickX && kickY) {
                if (Math.abs(kickXPercent) < Math.abs(kickYPercent)) { // kick x axis mostly
                    super.move(kickXVec);
                }
                else { // kick y axis mostly
                    super.move(kickYVec);
                }
            }
            this.grappleTime = 0;
        }

        const touchingTiles = [];
        for (const i of this.level.blockList) {
            if (this.pos.x + WIDTH + TOUCH_THRESHOLD >= i.pos.x &&
                this.pos.x <= i.pos.x + i.dimensions.x + TOUCH_THRESHOLD &&
                this.pos.y + HEIGHT + TOUCH_THRESHOLD >= i.pos.y &&
                this.pos.y <= i.pos.y + i.dimensions.y + TOUCH_THRESHOLD)
                    touchingTiles.push(i);
        }

        for (const i of touchingTiles) {
            // check for passable tiles first then handle things normally
            if (this.hitbox.collidesWith(i)) {
                if (i.blockDir === "down" && this.pos.y + HEIGHT > i.pos.y) continue;
                if (i.blockDir === "up" && this.pos.y < i.pos.y + i.dimensions.y) continue;
                if (i.blockDir === "left" && this.pos.x < i.pos.x + i.dimensions.x) continue;
                if (i.blockDir === "right" && this.pos.x + WIDTH > i.pos.x) continue; 
            }
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


        if (this.touching.get("right") || this.touching.get("left"))
            this.vel.x = 0;
        if (this.touching.get("up")) this.vel.y = 0;
    }
    setSpawn(x, y) {
        this.spawnX = x;
        this.spawnY = y;
    }
}
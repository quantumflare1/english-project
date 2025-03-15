import * as Thing from "./thing.mjs";
import * as Level from "./level.mjs";
import * as Tile from "./tile.mjs";
import Vector from "./vector.mjs"
import * as Event from "./event.mjs";
import config from "../data/config/player.json" with { type: "json" };

export default class Player extends Thing.Entity {
    static #width = config.width;
    static #height = config.height;
    static #accelTicks = config.accelTime;
    static #maxVel = config.maxVel;
    static #decelTicks = config.decelTime;
    static #maxGrappleTicks = config.maxGrappleTime;
    static #grappleVel = config.grappleVel;
    static #grappleFreezeTicks = config.grappleFreezeTime;
    static #grappleOffset = new Vector(config.grappleOffsetX, config.grappleOffsetY);
    static #grappleRange = config.grappleRange;
    static #grappleDeadZone = config.grappleDeadZone;
    static #jumpHeight = config.jumpHeight;
    static #jumpTime = config.jumpTime;
    static #terminalVel = config.terminalVel;
    static #minJumpFactor = config.minJumpFactor;
    static #airAccelFactor = config.airAccelFactor;
    static #airDecelFactor = config.airDecelFactor;
    static #respawnTicks = config.respawnTime;
    static #coyoteTicks = config.coyoteTime;
    static #bufferTicks = config.bufferTime;
    static #touchThreshold = 0.01;
    static #cameraOffsetX = -160 + config.width / 2;
    static #cameraOffsetY = -90 + config.height / 2;
    static state = {
        DEFAULT: 0,
        INTRO: 1,
        GRAPPLED: 2
    };

    static #accelPerTick = this.#maxVel / this.#accelTicks;
    static #decelPerTick = this.#maxVel / this.#decelTicks;
    static #gravity = (this.#jumpHeight * 2) / (this.#jumpTime ** 2);
    static #baseJumpVel = Math.sqrt(2 * this.#gravity * this.#jumpHeight);

    vel = new Vector();
    touching = new Map();
    inputs = new Set();
    jumpTimer = 20;
    jumpBufferTime = Player.#bufferTicks;
    grappleBufferTime = Player.#bufferTicks;
    coyoteTime = Player.#coyoteTicks;
    facing = new Vector(1, 0);
    lastFacedX = 1;
    canGrapple = false;
    grappleTime = 0;
    grapple = new Vector();
    state = Player.state.DEFAULT;
    grappleStarted = false;
    inControl = true;
    isDead = false;
    respawnTime = Player.#respawnTicks;
    temp; spawnX; spawnY;

    /**
     * 
     * @param {Vector} s 
     * @param {Vector} d 
     * @returns Vector
     */
    static #raycast(s, d) {
        // dda implementation basically taken straight from wikipedia
        let pos = new Vector(s.x / 10, s.y / 10);
        const step = Math.abs(d.x) > Math.abs(d.y) ? Math.abs(d.x) : Math.abs(d.y);
        const delta = new Vector(d.x / step, d.y / step);
    
        if (d.x < 0) {
            const diff = Math.ceil(pos.x) - pos.x;
            pos.x -= diff;
            pos.y -= delta.y * diff;
        }
        if (d.x > 0) {
            const diff = Math.floor(pos.x) - pos.x;
            pos.x -= diff;
            pos.y -= delta.y * diff;
        }
        if (d.y < 0) {
            const diff = Math.ceil(pos.y) - pos.y;
            pos.x -= delta.x * diff;
            pos.y -= diff;
        }
        if (d.y > 0) {
            const diff = Math.floor(pos.y) - pos.y;
            pos.x -= delta.x * diff;
            pos.y -= diff;
        }
    
        if (pos.y >= Level.level.rooms[Level.curRoomId].height || pos.y < 0 || pos.x >= Level.level.rooms[Level.curRoomId].width || pos.x < 0) {
            return null;
        }
        while (Level.level.rooms[Level.curRoomId].tiles[Math.floor(pos.y)][Math.floor(pos.x)] !== 1) {
            pos.x += delta.x;
            pos.y += delta.y;
    
            if (pos.y >= Level.level.rooms[Level.curRoomId].height || pos.y < 0 || pos.x >= Level.level.rooms[Level.curRoomId].width || pos.x < 0) {
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
    
        if (rayLength < Player.#grappleDeadZone || rayLength > Player.#grappleRange) {
            return null;
        }
        return pos;
    }

    constructor(x, y) {
        super(x, y, Player.#width, Player.#height, config.spriteSrc, -1, new Thing.SpriteConfig(...config.sprite));
        this.temp = Player.#raycast(new Vector(x, y), this.facing);
        this.spawnX = x;
        this.spawnY = y;

        this.touching.set("down", false);
        this.touching.set("up", false);
        this.touching.set("left", false);
        this.touching.set("right", false);

        dispatchEvent(new Event.CameraMoveEvent(this.x + Player.#cameraOffsetX, this.y + Player.#cameraOffsetY, true));

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
                this.respawnTime = Player.#respawnTicks;
                dispatchEvent(new Event.CameraMoveEvent(this.x + Player.#cameraOffsetX, this.y + Player.#cameraOffsetY, true));
            }
            return;
        }

        if (!this.touching.get("down")) {
            if (this.vel.y < Player.#terminalVel)
                this.vel.y += Player.#gravity;

            if (this.grappleTime === 0) this.coyoteTime--;
        } else {
            this.vel.y = 0;
            this.coyoteTime = Player.#coyoteTicks;
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
            this.coyoteTime = Player.#coyoteTicks;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.vel.x;
        this.y += this.vel.y;

        dispatchEvent(new Event.CameraMoveEvent(this.x + Player.#cameraOffsetX, this.y + Player.#cameraOffsetY));

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
        if (Level.rooms[Level.curRoomId].right && this.x > Level.rooms[Level.curRoomId].width * 10 - Player.#width/2) {
            const nextRoom = Level.rooms[Level.curRoomId].right;
            this.x = -Player.#width/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("right"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
        if (Level.rooms[Level.curRoomId].left && this.x < -Player.#width/2) {
            const nextRoom = Level.rooms[Level.curRoomId].left;
            this.x = nextRoom.width * 10 - Player.#width/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("left"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
        if (Level.rooms[Level.curRoomId].down && this.x > Level.rooms[Level.curRoomId].height * 10 - Player.#height/2) {
            const nextRoom = Level.rooms[Level.curRoomId].down;
            this.y = -Player.#height/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("down"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
        if (Level.rooms[Level.curRoomId].up && this.x < -Player.#height/2) {
            const nextRoom = Level.rooms[Level.curRoomId].up;
            this.y = nextRoom.width * 10 - Player.#height/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(new Event.RoomChangeEvent("up"));
            dispatchEvent(new Event.CameraMoveEvent(this.x, this.y, true));
        }
    }
    processRun() {
        const acceleration = this.touching.get("down") ? Player.#accelPerTick : Player.#accelPerTick * Player.#airAccelFactor;
        const deceleration = this.touching.get("down") ? Player.#decelPerTick : Player.#decelPerTick * Player.#airDecelFactor;
        if (this.inputs.has("arrowright") && !this.touching.get("right")) {
            if (this.vel.x < Player.#maxVel)
                this.vel.x += acceleration;
            else if (this.vel.x > Player.#maxVel) {
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
            if (this.vel.x > -Player.#maxVel)
                this.vel.x -= acceleration;
            else if (this.vel.x < -Player.#maxVel) {
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
            this.grappleBufferTime = Player.#bufferTicks;
            this.grappleTime = 0;
        }

        if (this.grappleStarted) {
            this.temp = Player.#raycast(new Vector(this.x + Player.#grappleOffset.x, this.y + Player.#grappleOffset.y), this.facing);
            this.grappleStarted = false;
            
            if (this.temp) {
                this.grapple = this.facing.normalize();
                this.grapple.multiply(Player.#grappleVel);
            }
            else {
                this.grapple = null;
            }

            if (this.temp) {
                this.canGrapple = false;
                this.grappleBufferTime = 0;
                this.grappleTime = Player.#maxGrappleTicks;
            }
        }

        if (this.grappleBufferTime > 0 && this.canGrapple && this.inputs.has("z")) { // start grapple
            this.temp = Player.#raycast(new Vector(this.x + Player.#grappleOffset.x, this.y + Player.#grappleOffset.y), this.facing);
            if (this.temp) {
                this.grappleStarted = true;
                const ev = new CustomEvent("game_freezetime", { detail: Player.#grappleFreezeTicks });
                dispatchEvent(ev);
            }
        }
    }
    processJump() {
        if (this.inputs.has(" ")) // press jump
            this.jumpBufferTime--;
        else // release jump
            this.jumpBufferTime = Player.#bufferTicks;
        
        if (!this.inputs.has(" ") && this.vel.y < 0)
            if (this.vel.y < -Player.#baseJumpVel * Player.#minJumpFactor)
                this.vel.y = -Player.#baseJumpVel * Player.#minJumpFactor;

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

        for (const i of Level.rooms[Level.curRoomId].tiles)
            if (this.x + Player.#width > i.x && this.x < i.x + i.width && this.y + Player.#height > i.y && this.y < i.y + i.height)
                overlappingTiles.push(i);

        // narrow phase
        for (const i of overlappingTiles) {
            let kickX, kickY;

            if (moveX > 0) kickX = i.x - (this.x + Player.#width);
            else if (moveX < 0) kickX = (i.x + i.width) - this.x;
            if (moveY > 0) kickY = i.y - (this.y + Player.#height);
            else if (moveY < 0) kickY = (i.y + i.width) - this.y;
            //console.log(moveX, moveY, "m")
            //console.log(this.x, this.y, "t")
            //console.log(i.x, i.y, "i")
            //console.log(kickX, kickY, "k")

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
                    //this.y += moveY * (kickXPercent);
                    moveX -= kickX;
                    moveY -= moveY * (kickXPercent);
                }
                else { // kick y axis mostly
                    //this.x += moveX * (kickYPercent);
                    this.y += kickY;
                    moveX -= moveX * (kickYPercent);
                    moveY -= kickY;
                }
            }

            for (const i of overlappingTiles) {
                if (!(this.x + Player.#width > i.x &&
                    this.x < i.x + i.width &&
                    this.y + Player.#height > i.y &&
                    this.y < i.y + i.height))
                        overlappingTiles.splice(overlappingTiles.indexOf(i), 1);
            }
            this.grappleTime = 0;
        }
        for (const i of Level.rooms[Level.curRoomId].hazards) {
            if (this.x + Player.#width > i.x &&
                this.x < i.x + i.width &&
                this.y + Player.#height > i.y &&
                this.y < i.y + i.height) {
                    if (i.facing === "up" && this.vel.y < 0) continue;
                    if (i.facing === "down" && this.vel.y > 0) continue;
                    if (i.facing === "right" && this.vel.x < 0) continue;
                    if (i.facing === "left" && this.vel.x > 0) continue;

                    this.isDead = true;
            }
        }

        const touchingTiles = [];
        for (const i of Level.tiles) {
            if (i.id !== 0 &&
                this.x + Player.#width + Player.#touchThreshold >= i.x &&
                this.x <= i.x + i.width + Player.#touchThreshold &&
                this.y + Player.#height + Player.#touchThreshold >= i.y &&
                this.y <= i.y + i.height + Player.#touchThreshold)
                    touchingTiles.push(i);
        }

        for (const i of touchingTiles) {
            if (this.x + Player.#width + Player.#touchThreshold > i.x &&
                this.x + Player.#touchThreshold < i.x + i.width &&
                this.y + Player.#height > i.y &&
                this.y < i.y + i.height && this.vel.x >= 0)
                    this.touching.set("right", true);
            if (this.x + Player.#width - Player.#touchThreshold > i.x &&
                this.x - Player.#touchThreshold < i.x + i.width &&
                this.y + Player.#height > i.y &&
                this.y < i.y + i.height && this.vel.x <= 0)
                    this.touching.set("left", true);
            if (this.x + Player.#width > i.x &&
                this.x < i.x + i.width &&
                this.y + Player.#height + Player.#touchThreshold > i.y &&
                this.y + Player.#touchThreshold < i.y + i.height && this.vel.y >= 0)
                    this.touching.set("down", true);
            if (this.x + Player.#width > i.x &&
                this.x < i.x + i.width &&
                this.y + Player.#height - Player.#touchThreshold > i.y &&
                this.y - Player.#touchThreshold < i.y + i.height && this.vel.y <= 0)
                    this.touching.set("up", true);
        }

        if (this.touching.get("up")) this.vel.y = 0;
    }
}
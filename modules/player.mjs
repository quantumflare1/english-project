import * as Thing from "./thing.mjs";
import * as Level from "./level.mjs";
import * as Tile from "./tile.mjs";

const WIDTH = 8;
const HEIGHT = 12;
const MAX_VEL_TIME = 8;
const MAX_VEL = 2;
const ACCEL_PER_TICK = MAX_VEL / MAX_VEL_TIME;
const TOUCH_THRESHOLD = 0.01;   // magic floating point error fixer

const MAX_GRAPPLE_TIME = 36;
const GRAPPLE_SPEED = 3.5;
const GRAPPLE_FREEZE_TIME = 3;
const GRAPPLE_START_OFFSET_X = 4;
const GRAPPLE_START_OFFSET_Y = 3;

const JUMP_HEIGHT = 32;
const JUMP_APEX_TIME = 24;
const GRAVITY = (JUMP_HEIGHT * 2) / (JUMP_APEX_TIME * JUMP_APEX_TIME);
const BASE_JUMP_VEL = Math.sqrt(2 * GRAVITY * JUMP_HEIGHT);
const MAX_FALL_VEL = 3;
const MIN_JUMP_SCALE = 0.3;

const AIR_ACCEL_FACTOR = 0.6;

const RESPAWN_TIME = 40;

const COYOTE_TICKS = 6;
const BUFFER_TICKS = 8;

const STATE = {
    DEFAULT: 0,
    INTRO: 1,
    GRAPPLED: 2
};

const spriteConfig = {
    relativeX: -3,
    relativeY: -4,
    sheetX: 0,
    sheetY: 0,
    width: 13,
    height: 16
};

function normalize(x, y) {
    let angle = Math.atan(y / x);
    if (angle > 0) return { x: x * Math.cos(angle), y: y * Math.sin(angle) };
    return { x: x * Math.cos(angle), y: -y * Math.sin(angle) };
}

/**
 * 
 * @param {number} sx 
 * @param {number} sy 
 * @param {number} dx 
 * @param {number} dy 
 * @returns 
 */
function raycast(sx, sy, dx, dy) {
    // dda implementation basically taken straight from wikipedia
    let posX = sx / 10;
    let posY = sy / 10;
    const step = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);
    const deltaX = dx / step;
    const deltaY = dy / step;

    if (posY >= Level.level.rooms[Level.curRoomId].height || posY < 0 || posX >= Level.level.rooms[Level.curRoomId].width || posX < 0) {
        return { x: null, y: null };
    }
    while (Level.level.rooms[Level.curRoomId].tiles[Math.floor(posY)][Math.floor(posX)] !== 1) {
        posX += deltaX;
        posY += deltaY;

        if (posY >= Level.level.rooms[Level.curRoomId].height || posY < 0 || posX >= Level.level.rooms[Level.curRoomId].width || posX < 0) {
            return { x: null, y: null };
        }
        if (Math.abs(posY - sy/10) > 9 || Math.abs(posX - sx/10) > 16) {
            return { x: null, y: null };
        }
    }
    posX *= 10;
    posY *= 10;

    return { x: posX, y: posY };
}

class Player extends Thing.Visible {
    constructor(x, y, w, h, s) {
        super(x, y, w, h, s, -1, spriteConfig);
        this.velX = 0;
        this.velY = 0;
        this.touching = new Map();
        this.inputs = new Set();
        this.jumpTimer = 20;
        this.jumpBufferTime = BUFFER_TICKS;
        this.coyoteTime = COYOTE_TICKS;
        this.facingX = 1;
        this.facingY = 0;
        this.lastFacedX = 1;
        this.temp = raycast(x, y, this.facingX, this.facingY);
        this.grappleBufferTime = BUFFER_TICKS;
        this.canGrapple = false;
        this.grappleTime = 0;
        this.grappleX = 0;
        this.grappleY = 0;
        this.state = STATE.DEFAULT;
        this.grappleStarted = false;

        this.inControl = true;

        this.spawnX = x;
        this.spawnY = y;

        this.isDead = false;
        this.respawnTime = RESPAWN_TIME;

        this.touching.set("down", false);
        this.touching.set("up", false);
        this.touching.set("left", false);
        this.touching.set("right", false);

        addEventListener("keydown", this.keydown);
        addEventListener("keyup", this.keyup);
    }
    keydown = (e) => this.inputs.add(e.key);
    keyup = (e) => this.inputs.delete(e.key);
    tick() {
        if (this.isDead) {
            this.respawnTime--;
            this.velX = 0;
            this.velY = 0;
            if (this.respawnTime <= 0) {
                this.isDead = false;
                this.x = this.spawnX;
                this.y = this.spawnY;
                this.jumpBufferTime = 0;
                this.coyoteTime = 0;
                this.respawnTime = RESPAWN_TIME;
            }
            return;
        }

        if (!this.touching.get("down")) {
            this.velY += GRAVITY;
            if (this.velY > MAX_FALL_VEL) {
                this.velY = MAX_FALL_VEL;
            }
            if (this.grappleTime === 0) this.coyoteTime--;
        } else {
            this.velY = 0;
            this.coyoteTime = COYOTE_TICKS;
            if (this.grappleTime === 0) this.canGrapple = true;
        }

        this.findFacingDirection();
        this.processGrapple();

        if (this.touching.get("right") || this.touching.get("left")) {
            this.velX = 0;
        }

        this.changeRoom();

        this.processJump();
        this.processRun();

        // DEBUG
        if (this.inputs.has("t")) {
            console.log(this.touching)
            console.log(this.x, this.y);
        }

        if (this.grappleTime > 0) {
            if (this.grappleX !== null) this.velX = this.grappleX;
            if (this.grappleY !== null) this.velY = this.grappleY;
            this.grappleTime--;
            this.coyoteTime = COYOTE_TICKS;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.velX;
        this.y += this.velY;

        this.collide();

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
    findFacingDirection() {
        if (this.inputs.has("ArrowRight")) {
            this.facingX = 1;
            this.lastFacedX = 1;
        }
        else if (this.inputs.has("ArrowLeft")) {
            this.facingX = -1;
            this.lastFacedX = -1;
        }
        else {
            this.facingX = 0;
        }
        if (this.inputs.has("ArrowDown")) {
            this.facingY = 1;
        }
        else if (this.inputs.has("ArrowUp")) {
            this.facingY = -1;
        }
        else {
            this.facingY = 0;
        }
        if (this.facingX === 0 && this.facingY === 0) {
            this.facingX = this.lastFacedX;
        }
    }
    changeRoom() {
        if (Level.rooms[Level.curRoomId].right && this.x > Level.rooms[Level.curRoomId].width * 10 - WIDTH/2) {
            const ev = new CustomEvent("game_roomtransition", { detail: "right" });
            const nextRoom = Level.rooms[Level.curRoomId].right;
            this.x = -WIDTH/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(ev);
        }
        if (Level.rooms[Level.curRoomId].left && this.x < -WIDTH/2) {
            const ev = new CustomEvent("game_roomtransition", { detail: "left" });
            const nextRoom = Level.rooms[Level.curRoomId].left;
            this.x = nextRoom.width * 10 - WIDTH/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(ev);
        }
        if (Level.rooms[Level.curRoomId].down && this.x > Level.rooms[Level.curRoomId].height * 10 - HEIGHT/2) {
            const ev = new CustomEvent("game_roomtransition", { detail: "down" });
            const nextRoom = Level.rooms[Level.curRoomId].down;
            this.y = -HEIGHT/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(ev);
        }
        if (Level.rooms[Level.curRoomId].up && this.x < -HEIGHT/2) {
            const ev = new CustomEvent("game_roomtransition", { detail: "up" });
            const nextRoom = Level.rooms[Level.curRoomId].up;
            this.y = nextRoom.width * 10 - HEIGHT/2;
            //this.y += Level.level.rooms[Level.curRoomId].leftOffset;
            dispatchEvent(ev);
        }
    }
    processRun() {
        const acceleration = this.touching.get("down") ? ACCEL_PER_TICK : ACCEL_PER_TICK * AIR_ACCEL_FACTOR;
        if (this.inputs.has("ArrowRight") && !this.touching.get("right")) {
            this.velX += acceleration;
            if (this.velX > MAX_VEL) {
                this.velX = MAX_VEL;
            }
        } else if (this.velX > 0) {
            this.velX -= acceleration;
            if (this.velX < 0.05) {
                this.velX = 0;
            }
        }
        if (this.inputs.has("ArrowLeft") && !this.touching.get("left")) {
            this.velX -= acceleration;
            if (this.velX < -MAX_VEL) {
                this.velX = -MAX_VEL;
            }
        } else if (this.velX < 0) {
            this.velX += acceleration;
            if (this.velX > -0.05) {
                this.velX = 0;
            }
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
            this.temp = raycast(this.x + GRAPPLE_START_OFFSET_X, this.y + GRAPPLE_START_OFFSET_Y, this.facingX, this.facingY);
            this.grappleStarted = false;
            
            if (this.temp.x && this.temp.y) {
                const grappleVector = normalize(this.facingX, this.facingY);
                this.grappleX = grappleVector.x * GRAPPLE_SPEED;
                this.grappleY = grappleVector.y * GRAPPLE_SPEED;
            }
            else {
                this.grappleX = null;
                this.grappleY = null;
            }

            if (this.temp.x !== null && this.temp.y !== null) {
                this.canGrapple = false;
                this.grappleBufferTime = 0;
                this.grappleTime = MAX_GRAPPLE_TIME;
            }
        }

        if (this.grappleBufferTime > 0 && this.canGrapple && this.inputs.has("z")) { // start grapple
            this.temp = raycast(this.x + GRAPPLE_START_OFFSET_X, this.y + GRAPPLE_START_OFFSET_Y, this.facingX, this.facingY);
            if (this.temp.x && this.temp.y) {
                this.grappleStarted = true;
                const ev = new CustomEvent("game_freezetime", { detail: GRAPPLE_FREEZE_TIME });
                dispatchEvent(ev);
            }
        }
    }
    processJump() {
        if (this.inputs.has(" ")) { // press jump
            this.jumpBufferTime--;
        } else { // release jump
            this.jumpBufferTime = BUFFER_TICKS;
        }
        if (!this.inputs.has(" ") && this.velY < 0) {
            if (this.velY < -BASE_JUMP_VEL * MIN_JUMP_SCALE) {
                this.velY = -BASE_JUMP_VEL * MIN_JUMP_SCALE;
            }
        }

        if (this.jumpBufferTime >= 0 && this.coyoteTime >= 0 && this.inputs.has(" ")) { // start jump
            this.velY = -BASE_JUMP_VEL;
            this.jumpTimer = 10;
            this.coyoteTime = 0;
            this.grappleTime = 0;
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

        for (const i of Level.tiles) {
            if (this.x + WIDTH > i.x && this.x < i.x + i.width && this.y + HEIGHT > i.y && this.y < i.y + i.height) {
                overlappingTiles.push(i);
            }
        }
        let overlappedHazards = 0;
        // narrow phase
        for (const i of overlappingTiles) {
            if (i instanceof Tile.Hazard) {
                overlappedHazards++;
                if (overlappingTiles.length === overlappedHazards && this.velY >= 0) {
                    this.isDead = true;
                }
                continue;
            }
            let kickX, kickY;

            if (moveX > 0) kickX = i.x - (this.x + WIDTH);
            else if (moveX < 0) kickX = (i.x + i.width) - this.x;
            if (moveY > 0) kickY = i.y - (this.y + HEIGHT);
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
                if (Math.abs(kickXPercent) < Math.abs(kickYPercent) && Math.abs(kickYPercent) !== 1) { // kick x axis mostly
                    this.x += kickX;
                    this.y += moveY * (kickXPercent);
                    moveX -= kickX;
                    moveY -= moveY * (kickXPercent);
                }
                else if (Math.abs(kickXPercent) > Math.abs(kickYPercent) || (Math.abs(kickYPercent) === 1 && Math.abs(kickXPercent) !== 1)) { // kick y axis mostly
                    this.x += moveX * (kickYPercent);
                    this.y += kickY;
                    moveX -= moveX * (kickYPercent);
                    moveY -= kickY;
                }
                else { // kick equal on both axes
                    this.x += moveX * 0.5;
                    this.y += kickY;
                    moveX -= moveX * 0.5;
                    moveY -= kickY;
                }
            }

            for (const i of overlappingTiles) {
                if (!(this.x + WIDTH > i.x && this.x < i.x + i.width && this.y + HEIGHT > i.y && this.y < i.y + i.height)) {
                    overlappingTiles.splice(overlappingTiles.indexOf(i), 1);
                }
            }
            this.grappleTime = 0;
        }

        const touchingTiles = [];
        for (const i of Level.tiles) {
            if (i.id === 1 && this.x + WIDTH + TOUCH_THRESHOLD >= i.x && this.x <= i.x + i.width + TOUCH_THRESHOLD && this.y + HEIGHT + TOUCH_THRESHOLD >= i.y && this.y <= i.y + i.height + TOUCH_THRESHOLD) {
                touchingTiles.push(i);
            }
        }

        for (const i of touchingTiles) {
            if (this.x + WIDTH + TOUCH_THRESHOLD > i.x && this.x + TOUCH_THRESHOLD < i.x + i.width && this.y + HEIGHT > i.y && this.y < i.y + i.height && this.velX >= 0) {
                this.touching.set("right", true);
            }
            if (this.x + WIDTH - TOUCH_THRESHOLD > i.x && this.x - TOUCH_THRESHOLD < i.x + i.width && this.y + HEIGHT > i.y && this.y < i.y + i.height && this.velX <= 0) {
                this.touching.set("left", true);
            }
            if (this.x + WIDTH > i.x && this.x < i.x + i.width && this.y + HEIGHT + TOUCH_THRESHOLD > i.y && this.y + TOUCH_THRESHOLD < i.y + i.height && this.velY >= 0) {
                this.touching.set("down", true);
            }
            if (this.x + WIDTH > i.x && this.x < i.x + i.width && this.y + HEIGHT - TOUCH_THRESHOLD > i.y && this.y - TOUCH_THRESHOLD < i.y + i.height && this.velY <= 0) {
                this.touching.set("up", true);
            }
        }

        if (this.touching.get("up")) this.velY = 0;
    }
}

let player;

function init() {
    player = new Player(230, 30, WIDTH, HEIGHT, "./data/assets/sprites/protagonist.png");
}

export { WIDTH, HEIGHT, player, init }
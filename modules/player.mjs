import * as Thing from "./thing.mjs";
import * as Level from "./level.mjs";

const SIZE = 10;
const MAX_VEL_TIME = 8;
const MAX_VEL = 2;
const ACCEL_PER_TICK = MAX_VEL / MAX_VEL_TIME;
const TOUCH_THRESHOLD = 0.01;   // magic floating point error fixer
const MAX_GRAPPLE_TIME = 36;

const JUMP_HEIGHT = 32;
const JUMP_APEX_TIME = 24;
const GRAVITY = (JUMP_HEIGHT * 2) / (JUMP_APEX_TIME * JUMP_APEX_TIME);
const BASE_JUMP_VEL = Math.sqrt(2 * GRAVITY * JUMP_HEIGHT);
const MAX_FALL_VEL = 3;
const MIN_JUMP_SCALE = 0.3;

const RESPAWN_TIME = 40;

const COYOTE_TICKS = 6;
const BUFFER_TICKS = 8;

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

    if (posY >= Level.level.length || posY < 0 || posX >= Level.level[Math.floor(posY)].length || posX < 0) {
        return { x: null, y: null };
    }
    while (Level.level[Math.floor(posY)][Math.floor(posX)] !== 1) {
        posX += deltaX;
        posY += deltaY;

        if (posY >= Level.level.length || posY < 0 || posX >= Level.level[Math.floor(posY)].length || posX < 0) {
            return { x: null, y: null };
        }
    }
    posX *= 10;
    posY *= 10;

    return { x: posX, y: posY };
}

class Player extends Thing.Visible {
    constructor(x, y, w, h, c) {
        super(x, y, w, h, c);
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
        this.bufferingGrapple = false;
        this.canGrapple = false;
        this.grappleTime = 0;
        this.grappleX = 0;
        this.grappleY = 0;

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
        if (this.touching.get("up")) {
            this.velY = 0;
        }

        if (this.inputs.has("z")) {
            this.bufferingGrapple = true;
        } else {
            this.bufferingGrapple = false;
            this.grappleTime = 0;
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
            this.canGrapple = true;
        }
        if (this.bufferingGrapple && this.canGrapple) { // start grapple
            this.bufferingGrapple = false;
            this.canGrapple = false;
            this.grappleTime = MAX_GRAPPLE_TIME;
            if (this.temp.x) this.grappleX = this.facingX * 3;
            else this.grappleX = null;
            if (this.temp.y) this.grappleY = this.facingY * 3;
            else this.grappleY = null;
        }
        if (this.touching.get("right") || this.touching.get("left")) {
            this.velX = 0;
        }

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

        if (this.inputs.has("ArrowRight") && !this.touching.get("right")) {
            this.velX += ACCEL_PER_TICK;
            if (this.velX > MAX_VEL) {
                this.velX = MAX_VEL;
            }
        } else if (this.velX > 0) {
            this.velX -= ACCEL_PER_TICK;
            if (this.velX < 0.05) {
                this.velX = 0;
            }
        }
        if (this.inputs.has("ArrowLeft") && !this.touching.get("left")) {
            this.velX -= ACCEL_PER_TICK;
            if (this.velX < -MAX_VEL) {
                this.velX = -MAX_VEL;
            }
        } else if (this.velX < 0) {
            this.velX += ACCEL_PER_TICK;
            if (this.velX > -0.05) {
                this.velX = 0;
            }
        }
        // DEBUG
        if (this.inputs.has("t")) {
            console.log(this.touching)
            console.log(this.x, this.y);
        }

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

        if (this.grappleTime > 0) {
            if (this.grappleX !== null) this.velX = this.grappleX;
            if (this.grappleY !== null) this.velY = this.grappleY;
            this.grappleTime--;
            this.coyoteTime = 2;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.velX;
        this.y += this.velY;

        let moveX = this.x - this.prevX;
        let moveY = this.y - this.prevY;

        this.touching.set("down", false);
        this.touching.set("left", false);
        this.touching.set("right", false);
        this.touching.set("up", false);

        // broad phase
        const overlappingTiles = [];
        for (const i of Level.tiles) {
            if (this.x + SIZE > i.x && this.x < i.x + i.width && this.y + SIZE > i.y && this.y < i.y + i.height) {
                overlappingTiles.push(i);
            }
        }
        // narrow phase
        for (const i of overlappingTiles) {
            if (i.id === 2) {

                // add celeste machanic here where spikes don't kill if you're moving the same direction they face
                if (overlappingTiles.length === 1) {
                    this.isDead = true;
                }
                overlappingTiles.splice(overlappingTiles.indexOf(i), 1);
            }
            let kickX, kickY;

            if (moveX > 0) kickX = i.x - (this.x + SIZE);
            else if (moveX < 0) kickX = (i.x + i.width) - this.x;
            if (moveY > 0) kickY = i.y - (this.y + SIZE);
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
            
            if (kickX && kickY) {
                const kickXPercent = kickX / moveX;
                const kickYPercent = kickY / moveY;
                if (Math.abs(kickXPercent) < Math.abs(kickYPercent)) {
                    this.x += kickX;
                    this.y += moveY * (kickXPercent);
                    moveX -= kickX;
                    moveY -= moveY * (kickXPercent);
                }
                else {
                    this.x += moveX * (kickYPercent);
                    this.y += kickY;
                    moveX -= moveX * (kickYPercent);
                    moveY -= kickY;
                }
            }

            for (const i of overlappingTiles) {
                if (!(this.x + SIZE > i.x && this.x < i.x + i.width && this.y + SIZE > i.y && this.y < i.y + i.height)) {
                    overlappingTiles.splice(overlappingTiles.indexOf(i), 1);
                }
            }
        }

        const touchingTiles = [];
        for (const i of Level.tiles) {
            if (this.x + SIZE + TOUCH_THRESHOLD >= i.x && this.x <= i.x + i.width + TOUCH_THRESHOLD && this.y + SIZE + TOUCH_THRESHOLD >= i.y && this.y <= i.y + i.height + TOUCH_THRESHOLD) {
                touchingTiles.push(i);
            }
        }

        for (const i of touchingTiles) {
            if (this.x + SIZE + TOUCH_THRESHOLD > i.x && this.x + TOUCH_THRESHOLD < i.x + i.width && this.y + SIZE > i.y && this.y < i.y + i.height) {
                this.touching.set("right", true);
            }
            if (this.x + SIZE - TOUCH_THRESHOLD > i.x && this.x - TOUCH_THRESHOLD < i.x + i.width && this.y + SIZE > i.y && this.y < i.y + i.height) {
                this.touching.set("left", true);
            }
            if (this.x + SIZE > i.x && this.x < i.x + i.width && this.y + SIZE + TOUCH_THRESHOLD > i.y && this.y + TOUCH_THRESHOLD < i.y + i.height) {
                this.touching.set("down", true);
            }
            if (this.x + SIZE > i.x && this.x < i.x + i.width && this.y + SIZE - TOUCH_THRESHOLD > i.y && this.y - TOUCH_THRESHOLD < i.y + i.height) {
                this.touching.set("up", true);
            }
        }

        if (this.y > 180) {
            this.y = -20;
        }
        this.temp = raycast(this.x + SIZE / 2, this.y + SIZE / 2, this.facingX, this.facingY);
    }
}

let player;

function init() {
    player = new Player(230, 30, SIZE, SIZE, "red");
}

export { player, init }
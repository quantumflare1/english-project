    import * as Thing from "./thing.mjs";
    import * as Level from "./level.mjs";

    const SIZE = 10;
    const ACCEL_PER_TICK = 0.4;
    const MAX_VEL = 2.5;
    const GRAVITY = 0.3;
    const MAX_FALL_VEL = 7;
    const TOUCH_THRESHOLD = 0.01;

    class Player extends Thing.Visible {
        constructor(x, y, w, h) {
            super(x, y, w, h);
            this.velX = 0;
            this.velY = 0;
            this.touching = new Map();
            this.inputs = new Set();
            this.isJumping = false;
            this.usedJump = false;
            this.jumpTimer = 20;

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
            if (this.touching.get("up")) {
                this.velY = 0;
            }
            if (!this.touching.get("down")) {
                this.velY += GRAVITY;
                if (this.velY > MAX_FALL_VEL) {
                    this.velY = MAX_FALL_VEL;
                }
            } else {
                this.velY = 0;
            }
            if (this.touching.get("right") || this.touching.get("left")) {
                this.velX = 0;
            }

            if (this.inputs.has(" ") && !this.usedJump) { // press jump
                this.isJumping = true;
            } else if (!this.inputs.has(" ")) { // release jump
                this.isJumping = false;
                this.usedJump = false;
            }
            if (!this.inputs.has(" ") && this.velY < 0) {
                this.velY /= 1.6;
            }

            if (this.isJumping && this.touching.get("down")) { // start jump
                this.velY = -5;
                this.isJumping = false;
                this.usedJump = true;
                this.jumpTimer = 10;
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
                let kickX, kickY;

                if (moveX > 0) kickX = i.x - (this.x + SIZE);
                else if (moveX < 0) kickX = (i.x + i.width) - this.x;
                if (moveY > 0) kickY = i.y - (this.y + SIZE);
                else if (moveY < 0) kickY = (i.y + i.width) - this.y;
                console.log(moveX, moveY, "m")
                console.log(this.x, this.y, "t")
                console.log(i.x, i.y, "i")
                console.log(kickX, kickY, "k")

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

            if (this.y > 1000) {
                this.y = 0;
            }
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
        }
    }

    let player;

    function init() {
        player = new Player(10, 10, SIZE, SIZE);
    }

    export { player, init }
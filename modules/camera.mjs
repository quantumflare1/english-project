import * as Level from "./level.mjs";
import Scene from "./scene.mjs"

function clamp(n) {
    if (n > 1) return 1;
    if (n < 0) return 0;
    return n;
}

function lerp(a, b, n) {
    return a + (b - a) * clamp(n);
}

export default class Camera {
    static #followTicks = 30;
    static #width = 320;
    static #height = 180;

    x; y; targetX; targetY; prevX; prevY; level;
    followTime = 0;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Level.Level} level 
     */
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;

        this.targetX = x;
        this.targetY = y;
        this.prevX = x;
        this.prevY = y;

        addEventListener("game_cameramove", (e) => {
            if (e.detail.instant) this.instantlyMoveTo(e.detail.x, e.detail.y);
            else this.moveTo(e.detail.x, e.detail.y);
        });
    }
    moveTo(x, y) {
        this.prevX = this.x;
        this.prevY = this.y;
        this.targetX = x;
        this.targetY = y;
        this.followTime = 0;
    }
    instantlyMoveTo(x, y) {
        this.prevX = x;
        this.prevY = y;
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
    }
    update() {
        this.followTime++;
        this.x = lerp(this.prevX, this.targetX, this.followTime / Camera.#followTicks);
        this.y = lerp(this.prevY, this.targetY, this.followTime / Camera.#followTicks);

        if (this.x < 0) this.x = 0;
        if (this.x + Camera.#width > this.level.rooms[this.level.curRoom].width * 10) this.x = this.level.rooms[this.level.curRoom].width * 10 - Camera.#width;
        if (this.y < 0) this.y = 0;
        if (this.y + Camera.#height > this.level.rooms[this.level.curRoom].height * 10) this.y = this.level.rooms[this.level.curRoom].height * 10 - Camera.#height;
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
    /**
     * Sets a scene's camera to this one
     * @param {Scene} scene 
     */
    addToScene(scene) {
        scene.camera = this;
    }
}
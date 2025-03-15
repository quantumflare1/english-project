import * as Level from "./level.mjs";

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

    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.targetX = x;
        this.targetY = y;
        this.prevX = x;
        this.prevY = y;
        this.followTime = 0;

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
        if (this.x + Camera.#width > Level.level.rooms[Level.curRoomId].width * 10) this.x = Level.level.rooms[Level.curRoomId].width * 10 - Camera.#width;
        if (this.y < 0) this.y = 0;
        if (this.y + Camera.#height > Level.level.rooms[Level.curRoomId].height * 10) this.y = Level.level.rooms[Level.curRoomId].height * 10 - Camera.#height;
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
}
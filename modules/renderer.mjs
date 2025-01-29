import * as Thing from "./thing.mjs";

const BASE_SCALE = 20;

class Renderer {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.scale = Math.min(innerHeight / (9 * BASE_SCALE), innerWidth / (16 * BASE_SCALE)) / 2;
        this.canvas.width = 16 * BASE_SCALE * this.scale;
        this.canvas.height = 9 * BASE_SCALE * this.scale;
        this.canvas.style = "display:block;position:absolute;top:0;left:0;bottom:0;right:0;margin:auto;";
        this.canvas.style.width = this.canvas.width;
        this.canvas.style.height = this.canvas.height;

        document.body.appendChild(this.canvas);
        const resize = this.resize.bind(this);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);

        addEventListener("resize", resize);
    }
    /**
     * @param {number} tickPercent from 0 - 1
     * @param  {...Thing.Visible} objs 
     */
    draw(tickPercent, ...objs) {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
        this.ctx.fillStyle = "black";
        for (const i of objs) {
            this.ctx.fillStyle = i.color;
            /*const diffX = i.x - i.prevX;
            const diffY = i.y - i.prevY;*/
            const diffX = 0;
            const diffY = 0;
            this.ctx.fillRect(Math.floor(i.x + diffX * tickPercent), Math.floor(i.y + diffY * tickPercent), i.width, i.height);
        }
    }
    resize() {
        this.scale = Math.min(innerHeight / (9 * BASE_SCALE), innerWidth / (16 * BASE_SCALE)) / 2;
        this.canvas.width = 16 * BASE_SCALE * this.scale;
        this.canvas.height = 9 * BASE_SCALE * this.scale;
        this.canvas.style.width = this.canvas.width;
        this.canvas.style.height = this.canvas.height;
        this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
        this.ctx.fillRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    }
}
export { Renderer }
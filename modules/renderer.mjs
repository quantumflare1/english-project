import * as Thing from "./thing.mjs";

class Renderer {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        document.body.appendChild(this.canvas);
        const resize = this.resize.bind(this);

        addEventListener("resize", resize);
    }
    /**
     * @param {number} tickPercent from 0 - 1
     * @param  {...Thing.Visible} objs 
     */
    draw(tickPercent, ...objs) {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, innerWidth, innerHeight);
        this.ctx.fillStyle = "black";
        for (const i of objs) {
            /*const diffX = i.x - i.prevX;
            const diffY = i.y - i.prevY;*/
            const diffX = 0;
            const diffY = 0;
            this.ctx.fillRect(Math.floor(i.x + diffX * tickPercent), Math.floor(i.y + diffY * tickPercent), i.width, i.height);
        }
    }
    resize() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
export { Renderer }
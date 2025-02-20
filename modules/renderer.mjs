import * as Thing from "./thing.mjs";
import * as Camera from "./camera.mjs";

const BASE_SCALE = 20;

class Renderer {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 16 * BASE_SCALE;
        this.canvas.height = 9 * BASE_SCALE;

        document.body.appendChild(this.canvas);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.setTransform(1, 0, 0, 1, -Camera.camera.x, -Camera.camera.y);
    }
    /**
     * @param {number} tickPercent from 0 - 1
     * @param  {...Thing.Visible} objs 
     */
    draw(tickPercent, ...objs) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.setTransform(1, 0, 0, 1, -Camera.camera.x, -Camera.camera.y);

        /*
        if (objs[0].temp.x) {
            this.ctx.strokeStyle = "green";
            this.ctx.beginPath();
            this.ctx.moveTo(objs[0].x + 5, objs[0].y + 5);
            this.ctx.lineTo(objs[0].temp.x, objs[0].temp.y);
    
            this.ctx.stroke();
            this.ctx.closePath();
        }*/

        for (const i of objs) {
            this.ctx.fillStyle = i.color;
            /*const diffX = i.x - i.prevX;
            const diffY = i.y - i.prevY;*/
            const diffX = 0;
            const diffY = 0;
            this.ctx.fillRect(Math.round(i.x + diffX * tickPercent), Math.round(i.y + diffY * tickPercent), i.width, i.height);
        }
    }
}

let renderer;

function init() {
    renderer = new Renderer();
}

export { Renderer, init, renderer }
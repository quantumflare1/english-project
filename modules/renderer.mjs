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
     * @param  {...Thing.Visible} pq 
     */
    draw(tickPercent, pq) {
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

        while (pq.length > 0) {
            const next = pq.pop();

            /*const diffX = next.x - next.prevX;
            const diffY = next.y - next.prevY;*/
            const diffX = 0;
            const diffY = 0;

            if (next.sprite) {
                this.ctx.drawImage(next.sprite, next.spriteSheetX, next.spriteSheetY, next.spriteWidth, next.spriteHeight, Math.round(next.x + diffX * tickPercent) + next.spriteRelativeX, Math.round(next.y + diffY * tickPercent) + next.spriteRelativeY, next.spriteWidth, next.spriteHeight);
            }
            else {
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(Math.round(next.x + diffX * tickPercent), Math.round(next.y + diffY * tickPercent), next.width, next.height);
            }
        }
    }
}

let renderer;

function init() {
    renderer = new Renderer();
}

export { Renderer, init, renderer }
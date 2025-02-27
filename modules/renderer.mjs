import * as Thing from "./thing.mjs";
import * as Camera from "./camera.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

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
     * @param  {FlatQueue} pq 
     */
    draw(tickPercent, pq) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.setTransform(1, 0, 0, 1, -Camera.camera.x, -Camera.camera.y);

        while (pq.length > 0) {
            const next = pq.pop();

            /*if (next.temp) {
                this.ctx.strokeStyle = "green";
                this.ctx.beginPath();
                this.ctx.moveTo(next.x + 5, next.y + 5);
                this.ctx.lineTo(next.temp.x, next.temp.y);
        
                this.ctx.stroke();
                this.ctx.closePath();
            }*/

            /*const diffX = next.x - next.prevX;
            const diffY = next.y - next.prevY;*/
            const diffX = 0;
            const diffY = 0;

            if (next.sprite) {
                this.ctx.drawImage(next.sprite,
                    next.spriteSheetX, next.spriteSheetY,
                    next.spriteWidth, next.spriteHeight,
                    Math.round(next.x + diffX * tickPercent) + next.spriteRelativeX, Math.round(next.y + diffY * tickPercent) + next.spriteRelativeY,
                    next.spriteWidth, next.spriteHeight);

                    /*this.ctx.strokeStyle = "red";
                    this.ctx.strokeRect(Math.round(next.x + diffX * tickPercent)+0.5, Math.round(next.y + diffY * tickPercent)+0.5, next.width-1, next.height-1);*/
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
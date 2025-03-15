import * as Thing from "./thing.mjs";
import Camera from "./camera.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

const BASE_SCALE = 20;

export default class Renderer {
    constructor(camera) {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.camera = camera;

        this.canvas.width = 16 * BASE_SCALE;
        this.canvas.height = 9 * BASE_SCALE;

        document.body.appendChild(this.canvas);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.setTransform(1, 0, 0, 1, -this.camera.x, -this.camera.y);
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
        this.ctx.setTransform(1, 0, 0, 1, -this.camera.x, -this.camera.y);

        let tempX = 0;
        let tempY = 0;

        while (pq.length > 0) {
            const next = pq.pop();

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

            /*
            if (next.temp) {
                this.ctx.strokeStyle = "red";
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(next.x + 4, next.y + 3);
                tempX = next.temp.x;
                tempY = next.temp.y;
            }*/
        }
        this.ctx.lineTo(tempX, tempY);

        this.ctx.stroke();
        this.ctx.closePath();
    }
}
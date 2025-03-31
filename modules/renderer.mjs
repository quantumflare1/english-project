import * as Thing from "./thing.mjs";
import Scene from "./scene.mjs";
import Camera from "./camera.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

const BASE_SCALE = 20;

export default class Renderer {
    canvas;
    ctx;
    camera;

    /**
     * Creates a new renderer
     * @param {Camera} camera 
     */
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
     * @param  {Scene} scene
     */
    draw(tickPercent, scene) {
        /*
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.setTransform(1, 0, 0, 1, -this.camera.x, -this.camera.y);*/

        let tempX = 0;
        let tempY = 0;

        while (scene.renderedObjects.length > 0) {
            const next = scene.renderedObjects.pop();

            this.ctx.setTransform(1, 0, 0, 1, -this.camera.x + this.camera.x * next.follow, -this.camera.y + this.camera.y * next.follow);

            /*const diffX = next.x - next.prevX;
            const diffY = next.y - next.prevY;*/
            const diffX = 0;
            const diffY = 0;

            if (next.sprite) {
                this.ctx.drawImage(next.sprite,
                    next.config.sheetX, next.config.sheetY,
                    next.config.width, next.config.height,
                    Math.round(next.x + diffX * tickPercent) + next.config.relativeX, Math.round(next.y + diffY * tickPercent) + next.config.relativeY,
                    next.config.width, next.config.height);

                    /*this.ctx.strokeStyle = "red";
                    this.ctx.strokeRect(Math.round(next.x + diffX * tickPercent)+0.5, Math.round(next.y + diffY * tickPercent)+0.5, next.width-1, next.height-1);*/
            }
            else {
                this.ctx.fillStyle = "black";
                this.ctx.fillRect(Math.round(next.x + diffX * tickPercent), Math.round(next.y + diffY * tickPercent), next.width, next.height);
            }
            if (next.string) {
                this.ctx.font = "10px Pixellari";
                this.ctx.textAlign = next.align;
                this.ctx.fillText(next.string, Math.round(next.x + diffX * tickPercent), Math.round(next.y + diffY * tickPercent));
            }


            if (next.temp) {
                this.ctx.strokeStyle = "red";
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(next.x + 4, next.y + 4);
                tempX = next.temp.x;
                tempY = next.temp.y;
            }
        }
        this.ctx.lineTo(tempX, tempY);

        this.ctx.stroke();
        this.ctx.closePath();
    }
}
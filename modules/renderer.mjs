import Scene from "./scene.mjs";
import Camera from "./node/camera.mjs";

const BASE_SCALE = 20;

export default class Renderer {
    canvas;
    ctx;

    /**
     * Creates a new renderer.
     */
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 16 * BASE_SCALE;
        this.canvas.height = 9 * BASE_SCALE;

        document.body.appendChild(this.canvas);

        this.ctx.imageSmoothingEnabled = false;
        //this.ctx.setTransform(1, 0, 0, 1, -this.camera.x, -this.camera.y);
    }
    /**
     * @param {number} tickPercent from 0 - 1
     * @param {Scene} scene
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

            this.ctx.setTransform(1, 0, 0, 1, -scene.camera.x + scene.camera.x * next.follow, -scene.camera.y + scene.camera.y * next.follow);

            /*const diffX = next.x - next.prevX;
            const diffY = next.y - next.prevY;*/
            const diffX = 0;
            const diffY = 0;

            next.draw(this.ctx);
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
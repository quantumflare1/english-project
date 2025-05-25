import Scene from "./scene.mjs";

const BASE_SCALE = 50;

export default class Renderer {
    canvas;
    ctx;
    gradient; // test

    /**
     * Creates a new renderer.
     * @param {HTMLElement} parent
     * @param {HTMLElement | null} before
     */
    constructor(parent = document.body, defaultBG1 = "#06001b", defaultBG2 = "#320031") {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.gradient = this.ctx.createLinearGradient(0, 0, 0, 9 * BASE_SCALE);
        this.gradient.addColorStop(0, defaultBG1);
        this.gradient.addColorStop(1, defaultBG2);

        this.canvas.width = 16 * BASE_SCALE;
        this.canvas.height = 9 * BASE_SCALE;

        parent.appendChild(this.canvas);

        this.ctx.imageSmoothingEnabled = false;
        //this.ctx.setTransform(1, 0, 0, 1, -this.camera.x, -this.camera.y);
    }
    /**
     * @param {number} tickPercent from 0 - 1
     * @param {Scene} scene
     */
    draw(tickPercent, scene) {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = this.gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let tempX = 0;
        let tempY = 0;

        this.ctx.setTransform(scene.camera.zoom, 0, 0, scene.camera.zoom, -scene.camera.pos.x, -scene.camera.pos.y);
        while (scene.renderedObjects.length > 0) {
            const next = scene.renderedObjects.pop();

            const diffX = 0;
            const diffY = 0;

            if (next.display === "follow") {
                this.ctx.setTransform(scene.camera.zoom, 0, 0, scene.camera.zoom, 0, 0);
                next.draw(this.ctx);
                this.ctx.setTransform(scene.camera.zoom, 0, 0, scene.camera.zoom, -scene.camera.pos.x, -scene.camera.pos.y);
            }
            else next.draw(this.ctx);
        }

    }
}
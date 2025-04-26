import Mouse from "./mouse.mjs";

export default class Editor {
    canvas; ctx;
    mouse;
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {CanvasRenderingContext2D} ctx 
     */
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = new Mouse(canvas);
    }
    update() {

    }
}
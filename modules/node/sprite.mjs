
import Vector from "../misc/vector.mjs";
import Node from "./node.mjs";
import Rect from "./rect.mjs";

export default class Sprite extends Node {
    pos = new Vector();
    z;
    source = new Rect();
    display;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} sourceX 
     * @param {number} sourceY 
     * @param {number} sourceWidth 
     * @param {number} sourceHeight 
     * @param {string} display 
     */
    constructor(x = 0, y = 0, sourceX = 0, sourceY = 0, sourceWidth = 0, sourceHeight = 0, display = "follow") {
        this.pos.x = x;
        this.pos.y = y;
        this.source.pos.x = sourceX;
        this.source.pos.y = sourceY;
        this.source.dimensions.x = sourceWidth;
        this.source.dimensions.y = sourceHeight;
        this.display = display;
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.drawImage();
    }
}
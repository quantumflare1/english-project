
import Vector from "../misc/vector.mjs";
import Node from "./node.mjs";
import Rect from "./rect.mjs";
import Assets from "../assets.mjs";

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
    constructor(x = 0, y = 0, z = 0, source = new Rect(), display = "follow") {
        this.pos.x = x;
        this.pos.y = y;
        this.z = z;
        this.source = source;
        this.display = display;
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.drawImage(Assets.spritesheet,
            this.source.pos.x, this.source.pos.y,
            this.source.dimensions.x, this.source.dimensions.y,
            this.pos.x, this.pos.y,
            this.source.dimensions.x, this.source.dimensions.y);
    }
    /**
     * 
     * @param {Vector} newPos 
     */
    update(newPos) {
        this.pos.x = newPos.x;
        this.pos.y = newPos.y;
    }
}
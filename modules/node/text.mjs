import Node from "./node.mjs";
import Vector from "../misc/vector.mjs";

export default class Text extends Node {
    pos = new Vector();
    text;
    z;
    align;
    display;
    font;
    color;

    /**
     * 
     * @param {string} text 
     * @param {string} align 
     * @param {string} font 
     * @param {string} color
     * @param {string} display 
     */
    constructor(x, y, z = 10, text = "", align = "start", font = "font0-0 16px", color = "white", display = "follow") {
        super();
        this.pos.x = x;
        this.pos.y = y;
        this.z = z;
        this.font = font;
        this.color = color;
        this.text = text;
        this.align = align;
        this.display = display;
    }
    /**
     * 
     * @param {Vector} move 
     */
    update(move) {
        this.pos.add(move);
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textAlign = this.align;
        ctx.fillText(this.text, this.pos.x, this.pos.y);
    }
}
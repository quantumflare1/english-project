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
    constructor(x, y, z = 10, text = "", align = "start", font = "16px Arial", color = "white", display = "follow") {
        super();
        this.pos.x = x;
        this.pos.y = y;
        this.z = z;
        this.font = font;
        this.color = color;
        this.align = align;
        this.display = display;

        this.setText(text);
    }
    /**
     * 
     * @param {Vector} move 
     */
    update(move = new Vector()) {
        this.pos.add(move);
    }
    setText(text = "") {
        this.text = text.split("\n");
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.textAlign = this.align;

        const lineHeight = parseInt(this.font.substring(0, 2)); //blewhhh whatever
        let linePos = 0;
        for (const i of this.text) {
            ctx.fillText(i, this.pos.x, this.pos.y + linePos);
            linePos += lineHeight;
        }
    }
}
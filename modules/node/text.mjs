import Node from "./node.mjs";
import Vector from "../misc/vector.mjs";

export default class Text extends Node {
    pos = new Vector();
    text;
    align;
    display;

    /**
     * 
     * @param {string} text 
     * @param {string} align 
     * @param {string} display 
     */
    constructor(x, y, text = "", align = "start", display = "follow") {
        this.pos.x = x;
        this.pos.y = y;
        this.text = text;
        this.align = align;
        this.display = display;
    }
    /**
     * 
     * @param {Vector} newPos 
     */
    update(newPos) {
        this.pos = newPos;
    }
}
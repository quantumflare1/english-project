import Vector from "../misc/vector.mjs";
import Node from "./node.mjs";

export default class Rect extends Node {
    pos = new Vector();
    dimensions = new Vector();

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.pos.x = x;
        this.pos.y = y;
        this.dimensions.x = w;
        this.dimensions.y = h;
    }
    /**
     * 
     * @param {Rect} r 
     */
    collidesWith(r) {
        return (this.pos.x + this.dimensions.x > r.pos.x && this.pos.x < r.pos.x + r.dimensions.width && this.pos.y + this.dimensions.y > r.pos.y && this.pos.y < r.pos.y + r.dimensions.y);
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
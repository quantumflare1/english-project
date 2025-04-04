import Node from "./node.mjs";
import Vector from "../misc/vector.mjs";

export default class Room extends Node {
    pos = new Vector();
    dimensions = new Vector();
    up; down; left; right;

    constructor(x, y, w, h) {
        this.pos.x = x;
        this.pos.y = y;
        this.dimensions.x = w;
        this.dimensions.y = h;
    }
    /**
     * 
     * @param {Room} r 
     */
    connectUp(r) {
        this.up = r;
        r.down = this;
    }
    /**
     * 
     * @param {Room} r 
     */
    connectDown(r) {
        this.down = r;
        r.up = this;
    }
    /**
     * 
     * @param {Room} r 
     */
    connectLeft(r) {
        this.left = r;
        r.right = this;
    }
    /**
     * 
     * @param {Room} r 
     */
    connectRight(r) {
        this.right = r;
        r.left = this;
    }
}
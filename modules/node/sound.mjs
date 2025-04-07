import Node from "./node.mjs";
import Vector from "../misc/vector.mjs";
import Assets from "../assets.mjs";

export default class Sound extends Node {
    pos = new Vector();
    source = new Audio();
    volume; loop; follow;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Audio} source 
     * @param {number} volume 
     * @param {boolean} loop 
     * @param {boolean} follow 
     */
    constructor(x = 0, y = 0, source = new Audio(), volume = 0, loop = false, follow = false) {
        super();
        this.pos.x = x;
        this.pos.y = y;
        this.source = source;
        this.volume = volume;
        this.loop = loop;
        this.follow = follow;
    }
    play() {
        // no clue how to do  this yet
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
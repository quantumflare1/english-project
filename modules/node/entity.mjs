import Node from "./node.mjs";
import Rect from "./rect.mjs";
import Sprite from "./sprite.mjs";
import Vector from "../misc/vector.mjs";

export default class Entity extends Node {
    pos = new Vector();
    hitbox = new Rect();
    sprite = new Sprite();
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Rect} hitbox 
     * @param {Sprite} sprite 
     */
    constructor(x = 0, y = 0, hitbox = new Rect(), sprite = new Sprite()) {
        super();
        this.pos.x = x;
        this.pos.y = y;
        this.hitbox = hitbox;
        this.sprite = sprite;
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
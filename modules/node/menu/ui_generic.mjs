import Sprite from "../sprite.mjs";
import Text from "../text.mjs";
import Node from "../node.mjs";

export default class UIGeneric extends Node {
    sprite; label;
    
    /**
     * 
     * @param {Sprite} sprite 
     * @param {Text} label 
     */
    constructor(sprite, label) {
        this.sprite = sprite;
        this.label = label;
    }
}
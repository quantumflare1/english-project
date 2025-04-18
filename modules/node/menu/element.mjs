import Text from "../text.mjs";
import Node from "../node.mjs";

export default class MenuElement extends Node {
    label; isSelected; isShallow;
    up; down; left; right;
    pos;
    
    /**
     * 
     * @param {Text} label 
     * @param {number} pos 
     * @param {boolean} shallow 
     */
    constructor(label, pos, shallow) {
        this.label = label;
        this.pos = pos;
        this.isSelected = false;
        this.isShallow = shallow;
    }
    toggleSelect() {
        this.isSelected = !this.isSelected;
    }
    interact() {

    }
    /**
     * 
     * @param {MenuElement} e 
     */
    setAboveElement(e) {
        this.up = e;
    }
    /**
     * 
     * @param {MenuElement} e 
     */
    setBelowElement(e) {
        this.down = e;
    }
    /**
     * 
     * @param {MenuElement} e 
     */
    setLeftElement(e) {
        this.left = e;
    }
    /**
     * 
     * @param {MenuElement} e 
     */
    setRightElement(e) {
        this.right = e;
    }
}
import * as Thing from "../thing.mjs";

export default class Button extends Thing.Entity {
    left; right; up; down;
    label;
    action;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Thing.Text} label 
     * @param {object} action 
     */
    constructor(x, y, label, action) {
        super(x, y, 64, 16, "../data/assets/sprites/menu_button.png", 0, new Thing.SpriteConfig(0, 0, 0, 0, 64, 16));
        this.label = label;
        this.action = action;
    }
    /**
     * 
     * @param {Button} button 
     */
    setLeft(button) {
        this.left = button;
    }
    /**
     * 
     * @param {Button} button 
     */
    setRight(button) {
        this.right = button;
    }
    /**
     * 
     * @param {Button} button 
     */
    setUp(button) {
        this.up = button;
    }
    /**
     * 
     * @param {Button} button 
     */
    setDown(button) {
        this.down = button;
    }
}
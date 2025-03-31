import Button from "./button.mjs";

export default class Menu {
    buttons = [];
    scene;
    selected;

    /**
     * 
     * @param {Button[]} buttons 
     */
    constructor(path, scene) {
        this.buttons = buttons;
        this.scene = scene;
        this.selected = this.buttons[0];

        for (const b of this.buttons) {
            
        }
    }
}
import { input, keybinds } from "../../inputs.mjs";
import { CameraMoveEvent, CameraSnapEvent, CursorMoveEvent } from "../../event.mjs";
import Node from "../node.mjs";
import MenuElement from "./element.mjs";
import Camera from "../camera.mjs";

export default class Cursor extends Node {
    elements;
    curElement;
    parent;
    /**
     * 
     * @param  {...MenuElement} elements 
     */
    constructor(parent, ...elements) {
        super();

        this.parent = parent;
        this.elements = [...elements];
        this.curElement = elements[0];

        addEventListener(CursorMoveEvent.code, (e) => {
            this.curElement.toggleHighlight();
            this.curElement = elements[e.detail]; // this fucking sucks. please change this
            dispatchEvent(new CameraSnapEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
        });
    }
    update() {
        if (!this.curElement) return;

        if (!this.curElement.isSelected) {
            if (input.impulse.has(keybinds.down) && this.curElement.down) {
                input.consumeInput(keybinds.down);
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.down;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
            if (input.impulse.has(keybinds.up) && this.curElement.up) {
                input.consumeInput(keybinds.up);
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.up;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
            if (input.impulse.has(keybinds.left) && this.curElement.left) {
                input.consumeInput(keybinds.left);
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.left;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
            if (input.impulse.has(keybinds.right) && this.curElement.right) {
                input.consumeInput(keybinds.right);
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.right;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
        }

        if (!this.curElement.isHighlighted) {
            this.curElement.toggleHighlight();
        }

        if (input.impulse.has(keybinds.select)) {
            input.consumeInput(keybinds.select);
            if (this.curElement.isShallow) {
                this.curElement.interact(this.parent);
            }
            else {
                this.curElement.toggleSelect();
            }
        }

        if (this.curElement.isSelected) {
            this.curElement.interact(this.curElement);
        }
    }
}
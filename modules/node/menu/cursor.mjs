import input from "../../inputs.mjs";
import { CameraMoveEvent, CameraSnapEvent } from "../../event.mjs";
import Node from "../node.mjs";
import MenuElement from "./element.mjs";
import Camera from "../camera.mjs";

export default class Cursor extends Node {
    elements;
    curElement;
    /**
     * 
     * @param  {...MenuElement} elements 
     */
    constructor(...elements) {
        super();

        this.elements = [...elements];
        this.curElement = elements[0];

        addEventListener("game_cursormove", (e) => {
            this.curElement.toggleHighlight();
            this.curElement = elements[e.detail]; // this fucking sucks. please change this
            dispatchEvent(new CameraSnapEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
        });
    }
    update() {
        if (!this.curElement) return;

        if (!this.curElement.isSelected) {
            if (input.impulse.has("arrowdown") && this.curElement.down) {
                input.consumeInput("arrowdown");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.down;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
            if (input.impulse.has("arrowup") && this.curElement.up) {
                input.consumeInput("arrowup");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.up;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
            if (input.impulse.has("arrowleft") && this.curElement.left) {
                input.consumeInput("arrowleft");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.left;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
            if (input.impulse.has("arrowright") && this.curElement.right) {
                input.consumeInput("arrowright");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.right;
                dispatchEvent(new CameraMoveEvent(this.curElement.pos.x - Camera.BASE_DIMENSIONS.x/2, this.curElement.pos.y - Camera.BASE_DIMENSIONS.y/2));
            }
        }

        if (!this.curElement.isHighlighted) {
            this.curElement.toggleHighlight();
        }

        if (input.impulse.has("z")) {
            input.consumeInput("z");
            if (this.curElement.isShallow) {
                this.curElement.interact();
            }
            else {
                this.curElement.toggleSelect();
            }
        }
    }
}
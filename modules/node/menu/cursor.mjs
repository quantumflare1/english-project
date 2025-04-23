import input from "../../inputs.mjs";
import Vector from "../../misc/vector.mjs";
import Node from "../node.mjs";
import MenuElement from "./element.mjs";

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
    }
    update() {
        if (!this.curElement.isSelected) {
            if (input.impulse.has("arrowdown") && this.curElement.down) {
                input.consumeInput("arrowdown");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.down;
            }
            if (input.impulse.has("arrowup") && this.curElement.up) {
                input.consumeInput("arrowup");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.up;
            }
            if (input.impulse.has("arrowleft") && this.curElement.left) {
                input.consumeInput("arrowleft");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.left;
            }
            if (input.impulse.has("arrowright") && this.curElement.right) {
                input.consumeInput("arrowright");
                this.curElement.toggleHighlight();
                this.curElement = this.curElement.right;
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
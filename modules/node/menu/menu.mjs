import Room from "../room.mjs";
import MenuElement from "./element.mjs";
import input from "../../inputs.mjs";

export default class Menu extends Room {
    cursor;
    items = [];
    constructor(x, y, w, h, id, ...inputs) {
        super(x, y, w, h, id);
        this.items = [...inputs];
        this.cursor = this.items[0];
    }
    /**
     * 
     * @param {...MenuElement} items 
     */
    addItem(...items) {
        this.items.push(...items);
    }
    update() {
        if (input.impulse.has("arrowup") && this.cursor.up) {
            input.consumeInput("arrowup");
            this.cursor = this.cursor.up;
        }
        if (input.impulse.has("arrowdown") && this.cursor.down) {
            input.consumeInput("arrowdown");
            this.cursor = this.cursor.down;
        }
        if (input.impulse.has("arrowleft") && this.cursor.left) {
            input.consumeInput("arrowleft");
            this.cursor = this.cursor.left;
        }
        if (input.impulse.has("arrowright") && this.cursor.right) {
            input.consumeInput("arrowright");
            this.cursor = this.cursor.right;
        }
        if (input.impulse.has("z")) {
            input.consumeInput("z");

            if (this.cursor.isShallow)
                this.cursor.interact();
            else
                this.cursor.toggleSelect();
        }
    }
}
import Room from "../room.mjs";

export default class Menu extends Room {
    cursorPos;
    inputs;
    constructor(x, y, w, h, id, ...inputs) {
        super(x, y, w, h, id);
        this.inputs = [...inputs];
        this.cursorPos = 0;
    }
    addInput(input) {
        this.inputs.push(input);
    }
}
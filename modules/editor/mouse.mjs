import Vector from "../misc/vector.mjs";

export default class Mouse {
    pos; pressed;
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.pos = new Vector(0, 0);
        this.pressed = false;

        canvas.addEventListener("mousemove", this.move.bind(this));
        canvas.addEventListener("mousedown", this.down.bind(this));
        canvas.addEventListener("mouseup", this.up.bind(this));
    }
    /**
     * 
     * @param {MouseEvent} e 
     */
    move(e) {
        this.pos.x = e.offsetX;
        this.pos.y = e.offsetY;
    }
    down() {
        this.pressed = true;
    }
    up() {
        this.pressed = false;
    }
}
import Rect from "./rect.mjs";

export default class FilledRect extends Rect {
    z; color;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    constructor(x = 0, y = 0, w = 0, h = 0, z, color = "#ffffff", display = "follow") {
        super(x, y, w, h);
        this.z = z;
        this.color = color;
        this.display = display;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.dimensions.x, this.dimensions.y);
    }
}
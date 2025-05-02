import Rect from "../node/rect.mjs";
import { prng } from "../misc/util.mjs";

export default class RoomBG extends Rect {
    color; z; id;
    fancy; hovering;
    constructor(x, y, w, h, id, z = -99) {
        super(x*10, y*10, w*10, h*10);
        this.z = z;

        this.id = id;
        const rand = prng(id);
        this.color = `rgba(${rand.next().value % 255}, ${rand.next().value % 255}, ${rand.next().value % 255}, 0.2)`;
        this.fancy = false;
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.pos.x + 0.5, this.pos.y + 0.5, this.dimensions.x - 1, this.dimensions.y - 1);
        if (this.fancy) {
            ctx.strokeStyle = "yellow";
            ctx.strokeRect(this.pos.x + 0.5, this.pos.y + 0.5, this.dimensions.x - 1, this.dimensions.y - 1);
        }
        else if (this.hovering) {
            ctx.strokeStyle = "pink";
            ctx.strokeRect(this.pos.x + 0.5, this.pos.y + 0.5, this.dimensions.x - 1, this.dimensions.y - 1);
        }
    }
}
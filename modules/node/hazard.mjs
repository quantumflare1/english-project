import Rect from "./rect.mjs";

export default class Hazard extends Rect {
    facing;

    constructor(x, y, w, h, f) {
        super(x, y, w, h);
        this.facing = f;
    }
}
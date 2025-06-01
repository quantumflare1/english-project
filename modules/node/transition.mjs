import FilledRect from "./filled_rect.mjs";
import { clamp } from "../misc/util.mjs";

export default class Transition extends FilledRect {
    static transTime = 15;

    type;
    ticks;
    constructor(type) {
        super(0, 0, 320, 180, 99, "rgba(0, 0, 0, 0)", "follow");
        this.type = type;
        this.ticks = 0;
    }
    update() {
        super.update();

        this.ticks++;
        if (this.type === "fadeout") {
            this.color = `rgba(0, 0, 0, ${clamp(this.ticks / Transition.transTime)})`;
        }
        else if (this.type === "fadein") {
            this.color = `rgba(0, 0, 0, ${1 - clamp(this.ticks / Transition.transTime)})`;
        }
    }
}
import FilledRect from "./filled_rect.mjs";
import { clamp } from "../misc/util.mjs";
import { SceneChangeEvent } from "../event.mjs";

export default class Transition extends FilledRect {
    static transTime = 15;

    type;
    ticks;
    constructor(type, nextScene, scene, wait = 0) {
        super(0, 0, 320, 180, 99, "rgba(0, 0, 0, 0)", "follow");
        this.type = type;
        this.ticks = 0;
        this.scene = scene;
        this.wait = wait;
        this.nextScene = nextScene;
    }
    update() {
        super.update();

        this.ticks++;
        if (this.type === "fadeout") {
            this.color = `rgba(0, 0, 0, ${clamp(this.ticks / Transition.transTime)})`;
            if (this.ticks >= Transition.transTime + this.wait) {
                dispatchEvent(new SceneChangeEvent(this.nextScene));
                this.nextScene.addNode(new Transition("fadein", null));
                this.scene.removeNode(this);
            }
        }
        else if (this.type === "fadein") {
            this.color = `rgba(0, 0, 0, ${1 - clamp(this.ticks / Transition.transTime)})`;
        }
    }
}
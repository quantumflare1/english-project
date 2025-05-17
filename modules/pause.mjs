import { SceneChangeEvent, UnpauseEvent } from "./event.mjs";
import { input, keybinds } from "./inputs.mjs";
import Scene from "./scene.mjs";

export default class PauseScene extends Scene {
    prevScene; cursor;

    /**
     * 
     * @param {Scene} prevScene 
     */
    constructor(camera, prevScene, ...rooms) {
        super("pause", camera, ...rooms);
        this.prevScene = prevScene;
    }
    update() {
        super.update();

        if (input.impulse.has(keybinds.pause)) {
            input.consumeInput(keybinds.pause);

            dispatchEvent(new SceneChangeEvent(this.prevScene));
        }
    }
}
// did this really have to be its own thing
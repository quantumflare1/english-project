import Rect from "./rect.mjs";

/**
 * @callback cb
 * 
 */

export default class Trigger extends Rect {
    scene;
    disabled; done;
    activations; maxActivations;

    touchScript; touchParams;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {string} trigger 
     * @param {cb} ontouch 
     */
    constructor(x, y, w, h, scene, maxActivations, ontouch, touchParams) {
        super(x, y, w, h);
        this.scene = scene;
        this.disabled = false;
        this.done = false;
        this.activations = 0;
        this.maxActivations = maxActivations;

        this.touchScript = ontouch.bind(this);
        this.touchParams = touchParams;
    }
    update() {
        if (this.activations === this.maxActivations)
            this.done = true;
    }
    ontouch(player) {
        this.touchScript(this.scene, player, ...this.touchParams);
    }
}
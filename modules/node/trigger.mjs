import Rect from "./rect.mjs";

/**
 * @callback cb
 * 
 */

export default class Trigger extends Rect {
    trigger; type;
    func;
    disabled; done;
    activations; maxActivations;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {string} trigger 
     * @param {cb} func 
     */
    constructor(x, y, w, h, trigger, type, maxActivations, func) {
        super(x, y, w, h);
        this.trigger = trigger;
        this.type = type;
        this.disabled = false;
        this.done = false;
        this.activations = 0;
        this.maxActivations = maxActivations;
        this.func = func;
    }
    update() {
        if (this.activations === this.maxActivations)
            this.done = true;
    }
}
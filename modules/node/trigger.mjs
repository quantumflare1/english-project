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
    interactScript; interactParams;
    z = 40;

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {cb} ontouch 
     * @param {cb} oninteract 
     */
    constructor(x, y, w, h, scene, maxActivations, ontouch = () => {}, touchParams = [], oninteract = () => {}, interactParams = []) {
        super(x, y, w, h);
        this.scene = scene;
        this.disabled = false;
        this.done = false;
        this.activations = 0;
        this.maxActivations = maxActivations;

        this.touchScript = ontouch.bind(this);
        this.touchParams = touchParams;
        this.interactScript = oninteract.bind(this);
        this.interactParams = interactParams;
    }
    update() {
        if (this.activations === this.maxActivations)
            this.done = true;
    }
    ontouch(player) {
        this.touchScript(this.scene, player, ...this.touchParams);
        this.activations++;
    }
    oninteract(player) {
        this.interactScript(this.scene, player, ...this.interactParams);
        this.activations++;
    }
    draw(ctx) {
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(this.pos.x, this.pos.y, this.dimensions.x, this.dimensions.y);
    }
}
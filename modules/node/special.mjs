import Scene from "../scene.mjs";
import Entity from "./entity.mjs";
import Rect from "./rect.mjs";
import Sprite from "./sprite.mjs";

export default class Special extends Entity {
    touchScript; activeScript;
    touchParams = []; activeParams = [];
    disabled; done;
    active;
    scene;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Rect} hitbox 
     * @param {Sprite} sprite 
     * @param {Scene} scene 
     * @param {() => void} onactive 
     * @param {any[]} touchParams 
     * @param {() => void} ontouch
     * @param {any[]} activeParams 
     */
    constructor(x, y, hitbox, sprite, scene, ontouch = () => {}, touchParams = [], onactive = () => {}, activeParams = []) {
        super(x, y, hitbox, sprite);
        this.disabled = false;
        this.done = false;
        this.active = false;
        this.scene = scene;

        this.touchScript = ontouch.bind(this);
        this.activeScript = onactive.bind(this);
        this.touchParams = touchParams;
        this.activeParams = activeParams;
    }
    update() {
        if (this.active) this.onactive();
    }
    ontouch(player) {
        this.touchScript(this.scene, player, ...this.touchParams);
    }
    onactive() {
        this.activeScript(...this.activeParams);
    }
}
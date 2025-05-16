import Entity from "./entity.mjs";
import Rect from "./rect.mjs";
import Sprite from "./sprite.mjs";
import * as Scripts from "../scripts.mjs";

export default class Special extends Entity {
    touchScripts = []; activeScripts = [];
    touchParams = []; activeParams = [];
    disabled; done;
    active;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {Rect} hitbox 
     * @param {Sprite} sprite 
     * @param {...object} funcs 
     */
    constructor(x, y, hitbox, sprite, ...funcs) {
        super(x, y, hitbox, sprite);
        this.disabled = false;
        this.done = false;
        this.active = false;

        for (const i of funcs) {
            if (i.trigger === "touch") {
                this.touchScripts.push(Scripts[i.name].bind(this));
                this.touchParams.push(i.params);
            }
            else if (i.trigger === "active") {
                this.activeScripts.push(Scripts[i.name].bind(this));
                this.activeParams.push(i.params);
            }
        }
    }
    update() {
        if (this.active) this.onactive();
    }
    ontouch(player) {
        for (let i = 0; i < this.touchScripts.length; i++)
            this.touchScripts[i](...this.touchParams[i], player);
    }
    onactive() {
        for (let i = 0; i < this.activeScripts.length; i++)
            this.activeScripts[i](...this.activeParams[i]);
    }
}
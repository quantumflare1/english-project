import Sprite from "./sprite.mjs";
import Rect from "./rect.mjs";
import Assets from "../assets.mjs";
import Vector from "../misc/vector.mjs";

export default class AnimatedSprite extends Sprite {
    frames = [];
    frameNum = 0;
    curTicks = 0;
    frameTime;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {Rect[]} sources 
     * @param {string} display 
     */
    constructor(x = 0, y = 0, z = 0, sources = [new Rect()], display = "follow", animPeriod = 5) {
        super(x, y, z, sources[0].pos.x, sources[0].pos.y, sources[0].dimensions.x, sources[0].dimensions.x, display);
        this.frames = sources;
        this.frameTime = animPeriod;
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.drawImage(Assets.spritesheet,
            this.sources[this.frameNum].pos.x, this.sources[this.frameNum].pos.y,
            this.sources[this.frameNum].dimensions.x, this.sources[this.frameNum].dimensions.y,
            this.pos.x, this.pos.y,
            this.sources[this.frameNum].dimensions.x, this.sources[this.frameNum].dimensions.y);
        frameTicks++;

        if (this.curTicks === this.frameTime) {
            this.frameNum++;
            this.curTicks = 0;
        }
    }
}
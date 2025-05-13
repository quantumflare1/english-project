import Sprite from "./sprite.mjs";
import Rect from "./rect.mjs";
import Assets from "../assets.mjs";
import Vector from "../misc/vector.mjs";

export default class AnimatedSprite extends Sprite {
    frames = [];
    frameNum = 0;
    curTicks = 0;
    frameTime;
    startFrame; endFrame;
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {Rect[]} sources 
     * @param {string} display 
     */
    constructor(x = 0, y = 0, z = 0, sources = [new Rect()], follow = 0, animPeriod = 5) {
        super(x, y, z, sources[0].pos.x, sources[0].pos.y, sources[0].dimensions.x, sources[0].dimensions.x, follow);
        this.frames = sources;
        this.frameTime = animPeriod;
        this.startFrame = 0;
        this.endFrame = sources.length - 1;
    }
    update() {
        this.curTicks++;

        if (this.curTicks === this.frameTime) {
            this.frameNum++;
            this.curTicks = 0;

            if (this.frameNum > this.endFrame) {
                this.frameNum = this.startFrame;
            }
        }
    }
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        ctx.drawImage(Assets.spritesheet,
            this.frames[this.frameNum].pos.x, this.frames[this.frameNum].pos.y,
            this.frames[this.frameNum].dimensions.x, this.frames[this.frameNum].dimensions.y,
            this.pos.x, this.pos.y,
            this.frames[this.frameNum].dimensions.x, this.frames[this.frameNum].dimensions.y);
    }
    /**
     * 
     * @param {number} num 
     */
    setStartFrame(num) {
        this.startFrame = num;
        if (this.frameNum < this.startFrame)
            this.frameNum = num;
    }
    /**
     * 
     * @param {number} num 
     */
    setEndFrame(num) {
        this.endFrame = num;
        if (this.frameNum > this.endFrame)
            this.frameNum = num;
    }
}
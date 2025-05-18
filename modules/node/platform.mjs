import Rect from "./rect.mjs";

export default class Platform extends Rect {
    blockDir;
    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {string} blockDir
     */
    constructor(x, y, w, h, blockDir = "") {
        super(x, y, w, h);
        this.blockDir = blockDir;
    }
}
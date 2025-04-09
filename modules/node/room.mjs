import Rect from "./rect.mjs";

export default class Room extends Rect {
    up; down; left; right;

    constructor(x, y, w, h) {
        super(x, y, w, h);
    }
    /**
     * 
     * @param {Room} r 
     * @param {string} dir 
     */
    connect(r, dir) {
        switch (dir) {
            case "up":
                this.up = r;
                r.down = this;
                break;
            case "down":
                this.down = r;
                r.up = this;
                break;
            case "left":
                this.left = r;
                r.right = this;
                break;
            case "right":
                this.right = r;
                r.left = this;
                break;
        }
    }
}
import Rect from "./rect.mjs";

export default class Room extends Rect {
    up; down; left; right; id;

    constructor(x, y, w, h, id) {
        super(x, y, w, h);
        this.id = id;
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
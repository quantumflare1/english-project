import Rect from "./rect.mjs";

export default class Room extends Rect {
    up; down; left; right; id;

    constructor(x, y, w, h, id) {
        super(x, y, w, h);
        this.id = id;

        this.up = [];
        this.down = [];
        this.left = [];
        this.right = [];
    }
    /**
     * 
     * @param {Room} r 
     * @param {string} dir 
     */
    connect(r, dir) {
        switch (dir) {
            case "up":
                this.up.push({ room: r, lower: Math.max(this.pos.x, r.pos.x) * 10, upper: Math.max(this.pos.x + this.dimensions.x, r.pos.x + r.dimensions.x) * 10 });
                r.down.push({ room: this, lower: Math.max(this.pos.x, r.pos.x) * 10, upper: Math.max(this.pos.x + this.dimensions.x, r.pos.x + r.dimensions.x) * 10 });
                break;
            case "down":
                this.down.push({ room: r, lower: Math.max(this.pos.x, r.pos.x) * 10, upper: Math.max(this.pos.x + this.dimensions.x, r.pos.x + r.dimensions.x) * 10 });
                r.up.push({ room: this, lower: Math.max(this.pos.x, r.pos.x) * 10, upper: Math.max(this.pos.x + this.dimensions.x, r.pos.x + r.dimensions.x) * 10 });
                break;
            case "left":
                this.left.push({ room: r, lower: Math.max(this.pos.y, r.pos.y) * 10, upper: Math.max(this.pos.y + this.dimensions.y, r.pos.y + r.dimensions.y) * 10 });
                r.right.push({ room: this, lower: Math.max(this.pos.y, r.pos.y) * 10, upper: Math.max(this.pos.y + this.dimensions.y, r.pos.y + r.dimensions.y) * 10 });
                break;
            case "right":
                this.right.push({ room: r, lower: Math.max(this.pos.y, r.pos.y) * 10, upper: Math.max(this.pos.y + this.dimensions.y, r.pos.y + r.dimensions.y) * 10 });
                r.left.push({ room: this, lower: Math.max(this.pos.y, r.pos.y) * 10, upper: Math.max(this.pos.y + this.dimensions.y, r.pos.y + r.dimensions.y) * 10 });
                break;
        }
    }
}
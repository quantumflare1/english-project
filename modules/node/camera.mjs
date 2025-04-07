import Node from "./node.mjs";
import Vector from "../misc/vector.mjs";
import Util from "../misc/util.mjs";

export default class Camera extends Node {
    static BASE_DIMENSIONS = new Vector(320, 180);
    static FOLLOW_TICKS = 30;

    pos = new Vector();
    prevPos = new Vector();
    targetPos = new Vector();
    followTime = 0;

    zoom;
    prevZoom;
    targetZoom;
    zoomTime = 0;

    constructor(x, y, zoom) {
        this.pos.x = x;
        this.pos.y = y;
        this.prevPos.x = x;
        this.prevPos.y = y;
        this.zoom = zoom;

        addEventListener("game_cameramove", (e) => {
            this.moveTo(e.detail.x, e.detail.y);
        });
        addEventListener("game_camerasnap", (e) => {
            this.snapTo(e.detail.x, e.detail.y);
        });
        addEventListener("game_camerazoom", (e) => {
            this.zoomTo(e.detail.x, e.detail.y);
        });
    }
    /**
     * 
     * @param {Vector} pos 
     */
    moveTo(pos) {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        this.targetPos = pos;
        this.followTime = 0;
    }
    /**
     * 
     * @param {Vector} pos 
     */
    snapTo(pos) {
        this.prevPos.x = pos.x;
        this.prevPos.y = pos.y;
        this.pos.x = pos.x;
        this.pos.y = pos.y;
        this.targetPos.x = pos.x;
        this.targetPos.y = pos.y;
    }
    /**
     * 
     * @param {number} zoom 
     */
    zoomTo(zoom) {
        this.prevZoom = this.zoom;
        this.targetZoom = zoom;
        this.zoomTime = 0;
    }
    update() {
        this.followTime++;
        this.pos.x = Util.lerp(this.prevPos.x, this.targetPos.x, this.followTime / Camera.FOLLOW_TICKS);
        this.pos.y = Util.lerp(this.prevPos.y, this.targetPos.y, this.followTime / Camera.FOLLOW_TICKS);

        this.zoomTime++;
        this.zoom = Util.lerp(this.prevZoom, this.targetZoom, this.zoomTime / Camera.FOLLOW_TICKS);

        if (this.pos.x < 0) this.pos.x = 0;
        if (this.pos.x + Camera.BASE_DIMENSIONS.x > this.level.rooms[this.level.curRoom].width * 10) this.pos.x = this.level.rooms[this.level.curRoom].width * 10 - Camera.BASE_DIMENSIONS.x;
        if (this.pos.y < 0) this.pos.y = 0;
        if (this.pos.y + Camera.BASE_DIMENSIONS.y > this.level.rooms[this.level.curRoom].height * 10) this.pos.y = this.level.rooms[this.level.curRoom].height * 10 - Camera.BASE_DIMENSIONS.y;
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
}
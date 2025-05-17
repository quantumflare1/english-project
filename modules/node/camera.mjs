import Node from "./node.mjs";
import Vector from "../misc/vector.mjs";
import { lerp } from "../misc/util.mjs";
import Room from "./room.mjs";
import { CameraMoveEvent, CameraSnapEvent, CameraZoomEvent } from "../event.mjs";

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

    locked = false;

    constructor(x, y, zoom) {
        super();
        this.pos.x = x;
        this.pos.y = y;
        this.prevPos.x = x;
        this.prevPos.y = y;
        this.prevZoom = zoom;
        this.targetZoom = zoom;
        this.zoom = zoom;

        addEventListener(CameraMoveEvent.code, (e) => {
            this.moveTo(e.detail);
        });
        addEventListener(CameraSnapEvent.code, (e) => {
            this.snapTo(e.detail);
        });
        addEventListener(CameraZoomEvent.code, (e) => {
            this.zoomTo(e.detail);
        });
    }
    /**
     * 
     * @param {Vector} pos 
     */
    moveTo(pos) {
        // broken
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
        this.targetPos.x = pos.x;
        this.targetPos.y = pos.y;
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
        this.followTime = 0;
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
    /**
     * 
     * @param {Room} room 
     */
    update(room) {
        this.followTime++;
        this.pos.x = lerp(this.prevPos.x, this.targetPos.x, this.followTime / Camera.FOLLOW_TICKS);
        this.pos.y = lerp(this.prevPos.y, this.targetPos.y, this.followTime / Camera.FOLLOW_TICKS);

        this.zoomTime++;
        this.zoom = lerp(this.prevZoom, this.targetZoom, this.zoomTime / Camera.FOLLOW_TICKS);

        if (room && !this.locked) {
            if (this.pos.x < room.pos.x * 10) this.pos.x = room.pos.x * 10;
            if (this.pos.x + Camera.BASE_DIMENSIONS.x > room.dimensions.x * 10 + room.pos.x * 10) this.pos.x = room.dimensions.x * 10 + room.pos.x * 10 - Camera.BASE_DIMENSIONS.x;
            if (this.pos.y < room.pos.y * 10) this.pos.y = room.pos.y * 10;
            if (this.pos.y + Camera.BASE_DIMENSIONS.y > room.dimensions.y * 10 + room.pos.y * 10) this.pos.y = room.dimensions.y * 10 + room.pos.y * 10 - Camera.BASE_DIMENSIONS.y;
        }

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
}
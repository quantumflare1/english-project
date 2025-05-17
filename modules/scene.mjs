import Node from "./node/node.mjs";
import Camera from "./node/camera.mjs";
import Room from "./node/room.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";
import { RoomChangeEvent } from "./event.mjs";

export default class Scene {
    nodes = new Set();
    renderedObjects = new FlatQueue();
    camera;
    name;
    rooms = [];
    curRoom = 0;
    /**
     * 
     * @param {string} name 
     * @param {Camera} camera 
     */
    constructor(name, camera, ...rooms) {
        this.name = name;
        this.camera = camera;

        // who the hell cares anymore
        this.rooms.push(...rooms);

        addEventListener(RoomChangeEvent.code, (e) => {
            this.curRoom = this.rooms[this.curRoom][e.detail].id;
        });
    }
    /**
     * 
     * @param  {...Room} rooms 
     */
    addRooms(...rooms) {
        this.rooms.push(...rooms);
    }
    /**
     * 
     * @param {Node} node 
     */
    addNode(node) {
        this.nodes.add(node);
    }
    /**
     * 
     * @param {Node} node 
     */
    removeNode(node) {
        this.nodes.delete(node);
    }
    refreshRenderList() {
        this.renderedObjects.clear();
        this.renderedObjects.shrink();
        for (const i of this.nodes) {
            if (i.draw) {
                this.renderedObjects.push(i, i.z);
            }
        }
    }
    update() {
        for (const i of this.nodes)
            i.update();
        this.camera.update(this.rooms[this.curRoom]);
    }
}
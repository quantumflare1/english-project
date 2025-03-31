import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

export default class Scene {
    entities = new Set();
    renderedObjects = new FlatQueue();
    camera;
    bg;
    name;
    constructor(name) {
        this.name = name;
    }
    setBG(bg) {
        this.bg = bg;
    }
    addEntity(entity) {
        this.entities.add(entity);
    }
    removeEntity(entity) {
        this.entities.delete(entity);
    }
    refreshRenderList() {
        this.renderedObjects.clear();
        this.renderedObjects.shrink();
        for (const i of this.entities) {
            this.renderedObjects.push(i, i.z);
        }
        this.renderedObjects.push(this.bg, -999);
    }
    setCamera(cam) {
        this.camera = cam;
    }
}
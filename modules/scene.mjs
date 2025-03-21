export default class Scene {
    entities = new Set();
    camera;
    name;
    constructor(name) {
        this.name = name;
    }
}
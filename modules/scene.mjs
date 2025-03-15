export default class Scene {
    constructor(things) {
        this.entities = [...things.entities];
        this.scripts = [...things.scripts];
        this.data = [...things.data];
    }
}
import Scene from "./scene.mjs";

class SpriteConfig {
    constructor(rx = 0, ry = 0, sx = 0, sy = 0, w = 10, h = 10) {
        this.relativeX = rx;
        this.relativeY = ry;
        this.sheetX = sx;
        this.sheetY = sy;
        this.width = w;
        this.height = h;
    }
}

class Thing {
    parentScene;
    constructor() {
        this.scripts = new Map();
    }
    execute(name) {
        this.scripts.get(name).run();
    }
}

class Entity extends Thing { // who up extending they thing
    x;
    y;
    width;
    height;
    prevX;
    prevY;
    sprite;
    spriteRelativeX;
    spriteRelativeY;
    spriteSheetX;
    spriteSheetY;
    spriteWidth;
    spriteHeight;
    z;
    /**
     * Creates a new entity
     * @param {number} x X coordinate of this entity in pixels
     * @param {number} y Y coordinate of this entity in pixels
     * @param {number} w Width of this entity in pixels
     * @param {number} h Height of this entity in pixels
     * @param {string | Image} src Sprite source for this entity
     * @param {number} z Z layer of this entity
     * @param {VisibleConfig} config Sprite settings for this entity
     */
    constructor(x, y, w, h, src, z = 0, config = new VisibleConfig()) {
        super();
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.prevX = x;
        this.prevY = y;
        if (src) {
            if (typeof src === "string") {
                this.sprite = new Image();
                this.sprite.src = src;
            }
            else {
                this.sprite = src;
            }

            this.spriteRelativeX = config.relativeX;
            this.spriteRelativeY = config.relativeY;
            this.spriteSheetX = config.sheetX;
            this.spriteSheetY = config.sheetY;
            this.spriteWidth = config.width;
            this.spriteHeight = config.height;
        }
        this.z = z;
    }
    /**
     * Adds this entity to a scene
     * @param {Scene} scene 
     */
    addToScene(scene) {
        scene.entities.add(this);
        this.parentScene = scene;
    }
    removeFromScene() {
        this.parentScene.entities.delete(this);
        this.parentScene = null;
    }
}

class Sound extends Thing {
    x;
    y;
    follow;
    loop;
    sound;
    volume;

    /**
     * Creates a new sound, currently unused
     * @param {number} x X coordinate of this sound in pixels
     * @param {number} y Y coordinate of this sound in pixels
     * @param {boolean} follow Whether this sound follows the camera or not
     * @param {string | Audio} src Audio source for this sound
     * @param {number} volume Volume of this sound
     * @param {boolean} loop Whether this sound will loop or not
     */
    constructor(x, y, follow, src, volume, loop) {
        super();
        this.x = x;
        this.y = y;
        this.follow - follow;
        this.loop = loop;
        if (src) {
            if (typeof src === "string") {
                this.sound = new Audio();
                this.sound.src = src;
            }
            else {
                this.sound = src;
            }
        }
        this.volume = volume;
    }
    play() {
        // ...
    }
}


export { Entity, Sound, SpriteConfig }
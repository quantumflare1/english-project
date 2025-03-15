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
    constructor() {
        this.scripts = new Map();
    }
    execute(name) {
        this.scripts.get(name).run();
    }
}

class Entity extends Thing { // who up extending they thing
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
}

class Sound extends Thing {
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {boolean} follow 
     * @param {string} src 
     * @param {number} volume 
     * @param {boolean} loop 
     */
    constructor(x, y, follow, src, volume, loop) {
        super();
        this.x = x;
        this.y = y;
        this.follow - follow;
        this.loop = loop;
        this.sound = new Audio();
        this.sound.src = src;
        this.volume = volume;
    }
    play() {
        // ...
    }
}


export { Entity, Sound, SpriteConfig }
class VisibleConfig {
    constructor(rx = 0, ry = 0, sx = 0, sy = 0, w = 10, h = 10) {
        this.relativeX = rx;
        this.relativeY = ry;
        this.sheetX = sx;
        this.sheetY = sy;
        this.width = w;
        this.height = h;
    }
}

class Visible {
    constructor(x, y, w, h, s, z = 0, config = new VisibleConfig()) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.prevX = x;
        this.prevY = y;
        if (s) {
            if (typeof s === "string") {
                this.sprite = new Image();
                this.sprite.src = s;
            }
            else {
                this.sprite = s;
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

class Trigger {
    constructor(x, y, w, h, effect) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.effect = effect;
    }
}

export { Visible, VisibleConfig, Trigger }
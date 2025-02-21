const defaultSpriteConfig = {
    relativeX: 0,
    relativeY: 0
};

class Visible {
    constructor(x, y, w, h, s, z = 0, config = defaultSpriteConfig) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.prevX = x;
        this.prevY = y;
        if (s) {
            this.sprite = new Image();
            this.sprite.src = s;

            this.spriteRelativeX = config.relativeX;
            this.spriteRelativeY = config.relativeY;
        }
        this.z = z;
    }
}

export { Visible }
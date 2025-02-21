function sanitizeConfig(obj) {
    if (!obj.relativeX) obj.relativeX = 0;
    if (!obj.relativeY) obj.relativeY = 0;
    if (!obj.sheetX) obj.sheetX = 0;
    if (!obj.sheetY) obj.sheetY = 0;
    if (!obj.width) obj.width = 10;
    if (!obj.height) obj.height = 10;

    return obj;
}

class Visible {
    constructor(x, y, w, h, s, z = 0, config) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.prevX = x;
        this.prevY = y;
        if (s) {
            this.sprite = new Image();
            this.sprite.src = s;

            const sc = sanitizeConfig(config);

            this.spriteRelativeX = sc.relativeX;
            this.spriteRelativeY = sc.relativeY;
            this.spriteSheetX = sc.sheetX;
            this.spriteSheetY = sc.sheetY;
            this.spriteWidth = sc.width;
            this.spriteHeight = sc.height;
        }
        this.z = z;
    }
}

export { Visible }
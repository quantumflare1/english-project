class Visible {
    constructor(x, y, w, h, c, z = 0) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.prevX = x;
        this.prevY = y;
        this.color = c;
        this.z = z;
    }
}

export { Visible }
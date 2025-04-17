export default class Vector {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    normalize() {
        let angle = Math.atan(this.y / this.x);
        if (angle > 0) return new Vector(this.x * Math.cos(angle), this.y * Math.sin(angle));
        return new Vector(this.x * Math.cos(angle), -this.y * Math.sin(angle));
    }
    zero() {
        this.x = 0;
        this.y = 0;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
    }
    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
    }
    multiply(n) {
        this.x *= n;
        this.y *= n;
    }
}
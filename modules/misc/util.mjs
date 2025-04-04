export default class Util {
    static clamp(n) {
        if (n > 1) return 1;
        if (n < 0) return 0;
        return n;
    }
    static lerp(a, b, n) {
        return a + (b - a) * this.clamp(n);
    }
}
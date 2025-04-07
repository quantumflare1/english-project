// linear congruential generator implementation
// taken from Mathematics of Computation Vol 68 #225 Jan 1999 pgs 249-260
// shoutout my guy Pierre L'Ecuyer

/**
 * Clamps a value to between 0 and 1.
 * @param {number} n The value to be clamped.
 * @returns The clamped value.
 */
function clamp(n) {
    if (n > 1) return 1;
    if (n < 0) return 0;
    return n;
}
/**
 * Linearly interpolates a value between two points.
 * @param {number} a The starting point.
 * @param {number} b The ending point.
 * @param {number} n The percentage of the distance between the two points. Values outside the range [0, 1] are clamped.
 * @returns 
 */
function lerp(a, b, n) {
    return a + (b - a) * clamp(n);
}
/**
 * @param {number} seed The seed for the RNG
 */
function* prng(seed) {
    const a = 5122456;
    const c = 99;
    const m = (1 << 30) - 35;
    while (true) {
        seed = (a * seed + c) % m;
        yield seed;
    }
}

export { clamp, lerp, prng };
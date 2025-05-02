// linear congruential generator implementation
// taken from Mathematics of Computation Vol 68 #225 Jan 1999 pgs 249-260
// shoutout my guy Pierre L'Ecuyer

import Rect from "../node/rect.mjs";

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

/**
 * 
 * @param {any[][]} mat 
 * @returns 
 */
function unpackMatrix(mat) {
    const arr = [];
    for (const i of mat)
        for (const j of i)
            arr.push(j);
    return arr;
}

/**
 * 
 * @param {number[][]} mat 
 */
function convertToAnimSpriteList(mat) {
    const arr = [];
    for (const i of mat) {
        arr.push(new Rect(i[0], i[1], i[2], i[3]));
    }
    return arr;
}

/**
 * 
 * @param {string} key 
 * @returns 
 */
function displayKey(key) {
    switch (key) {
        case " ":
            return "Space";
        case "alt":
            return "Alt";
        case "shift":
            return "Shift";
        case "tab":
            return "Tab";
        case "capslock":
            return "CapsLock";
        case "enter":
            return "Enter";
        case "control":
            return "Ctrl";
        case "contextmenu":
            return "ContextMenu";
        case "backspace":
            return "Backspace";
        case "insert":
            return "Insert";
        case "delete":
            return "Delete";
        case "home":
            return "Home";
        case "end":
            return "End";
        case "pageup":
            return "PageUp";
        case "pagedown":
            return "PageDown";
        case "arrowup":
            return "ArrowUp";
        case "arrowdown":
            return "ArrowDown";
        case "arrowleft":
            return "ArrowLeft";
        case "arrowright":
            return "ArrowRight";
        default:
            return key.toUpperCase();
    }
}

export { clamp, lerp, prng, unpackMatrix, convertToAnimSpriteList, displayKey };
import * as Thing from "./thing.mjs";

class Tile extends Thing.Visible {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }
}

class Block extends Tile {
    constructor(x, y, w, h) {
        super(x, y, w, h);
    }
}

export { Block }
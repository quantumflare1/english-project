import * as Thing from "./thing.mjs";

class Tile extends Thing.Visible {
    constructor(x, y, w, h, c, id) {
        super(x, y, w, h, c);
        this.id = id;
    }
}

class Block extends Tile {
    constructor(x, y, w, h, c, id) {
        super(x, y, w, h, c, id);
    }
}

class Hazard extends Tile {
    constructor(x, y, w, h, c, id) {
        super(x, y, w, h, c, id);
    }
}

export { Block }
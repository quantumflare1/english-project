import * as Thing from "./thing.mjs";

class Tile extends Thing.Visible {
    constructor(x, y, w, h, id, z = 0) {
        super(x, y, w, h, false, z);
        this.id = id;
    }
}

class Block extends Tile {
    constructor(x, y, w, h, id) {
        super(x, y, w, h, id);
    }
}

class Hazard extends Tile {
    constructor(x, y, w, h, id) {
        super(x, y, w, h, id);
    }
}

class Decal extends Tile {
    constructor(x, y, w, h, id, z) {
        super(x, y, w, h, id, z);
    }
}

export { Block, Hazard, Decal }
import * as Thing from "./thing.mjs";

class Tile extends Thing.Visible {
    constructor(x, y, w, h, s, id, z = 0, c = {}) {
        super(x, y, w, h, s, z, c);
        this.id = id;
    }
}

class Block extends Tile {
    constructor(x, y, w, h, s, id, z, c) {
        super(x, y, w, h, s, id, z, c);
    }
}

class Hazard extends Tile {
    constructor(x, y, w, h, s, id, z, c) {
        super(x, y, w, h, s, id, z, c);
    }
}

class Decal extends Tile {
    constructor(x, y, w, h, s, id, z, c) {
        super(x, y, w, h, s, id, z, c);
    }
}

export { Block, Hazard, Decal }
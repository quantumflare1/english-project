import * as Thing from "./thing.mjs";

class Tile extends Thing.Visible {
    constructor(x, y, w, h, c, id, z = 0) {
        super(x, y, w, h, c);
        this.id = id;
        this.z = z;
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

class Decal extends Tile {
    constructor(x, y, w, h, c, id, z) {
        super(x, y, w, h, c, id, z);
    }
}

export { Block, Hazard, Decal }
import * as Thing from "./thing.mjs";
import * as Tile from "./tile.mjs";
import level from "../data/level/level.json" with { type: "json" };
import tileSprites from "../data/tile/tiles.json" with { type: "json" };

class Room {
    constructor(id, w, h, x, y, tiles, hazards, decals, special, triggers) {
        this.id = id;
        this.width = w;
        this.height = h;
        this.tiles = tiles;
        this.hazards = hazards;
        this.decals = decals;
        this.special = special;
        this.triggers = triggers;

        this.x = x;
        this.y = y;

        this.up = null;
        this.left = null;
        this.down = null;
        this.right = null;
    }
    connectUp(room) {
        this.up = room;
        room.down = this;
    }
    connectLeft(room) {
        this.left = room;
        room.right = this;
    }
    connectDown(room) {
        this.down = room;
        room.up = this;
    }
    connectRight(room) {
        this.right = room;
        room.left = this;
    }
}

const tiles = [];
const decals = [];
const rooms = [];
let curRoomId;

// linear congruential generator implementation
// taken from Mathematics of Computation Vol 68 #225 Jan 1999 pgs 249-260
// shoutout my guy Pierre L'Ecuyer
function* prng(seed) {
    const a = 5122456;
    const c = 99;
    const m = (1 << 30) - 35;
    while (true) {
        seed = (a * seed + c) % m;
        yield seed;
    }
}

const rand = prng(123456789);

const tileTypes = {
    1: {
        offX: 0,
        offY: 0,
        w: 10,
        h: 10
    }
};

const hazardTypes = {
    1: {
        offX: 0,
        offY: 7,
        w: 10,
        h: 3,
        facing: "up"
    },
};

const decalTypes = {
    1: {
        offX: 2,
        offY: 2,
        w: 6,
        h: 6,
        z: 2
    }
}

function loadRoom(id) {
    tiles.splice(0);
    decals.splice(0);
    for (const i of rooms[id].tiles) {
        tiles.push(i);
    }
    for (const i of rooms[id].decals) {
        decals.push(i);
    }
}

const testImage = new Image(); testImage.src = "../data/assets/tiles/tile_grass.png";

function loadLevel() {                          // TODO: rewrite hazards to use their own thing
    for (let i = 0; i < 100; i++) {
        console.log(rand.next().value);
    }
    const sprMap = new Map();
    for (const i of tileSprites) {
        const img = new Image();
        img.src = i.sprite.src;
        sprMap.set(i.name, img);
    }
    for (const i of level.rooms) {
        // preprocess room data
        const curRoomTiles = [];
        const curRoomHazards = [];
        const curRoomDecals = [];
        const curRoomSpecials = [];
        const curRoomTriggers = [];
        for (let r = 0; r < i.height; r++) {
            for (let c = 0; c < i.width; c++) {
                if (i.tiles[r][c] !== 0) {
                    const thisTile = tileTypes[i.tiles[r][c]];
                    const thisTileSprite = tileSprites[i.tiles[r][c]-1];
                    let textureId = 0;

                    if (!thisTileSprite) {
                        curRoomTiles.push(new Tile[thisTile.type](c * 10 + thisTile.offX, r * 10 + thisTile.offY, thisTile.w, thisTile.h,
                            false, i.tiles[r][c])
                        );
                        continue;
                    }

                    const nw = (c - 1 >= 0 && r - 1 >= 0) ?             i.tiles[r-1][c-1] > 0 : true;
                    const n =  (r - 1 >= 0) ?                           i.tiles[r-1][c] > 0 : true;
                    const ne = (c + 1 < i.width && r - 1 >= 0) ?        i.tiles[r-1][c+1] > 0 : true;
                    const w =  (c - 1 >= 0) ?                           i.tiles[r][c-1] > 0 : true;
                    const e =  (c + 1 < i.width) ?                           i.tiles[r][c+1] > 0 : true;
                    const sw = (c - 1 >= 0 && r + 1 < i.height) ?       i.tiles[r+1][c-1] > 0 : true;
                    const s =  (r + 1 < i.height) ?                     i.tiles[r+1][c] > 0 : true;
                    const se = (c + 1 < i.width && r + 1 < i.height) ?  i.tiles[r+1][c+1] > 0 : true;

                    const texVariant = thisTileSprite.sprite.texture;

                    if (n && w && e && s) textureId = texVariant.inner;
                    else if (!n && w && e && s) textureId = texVariant.edge_top;
                    else if (n && !w && e && s) textureId = texVariant.edge_left;
                    else if (n && w && !e && s) textureId = texVariant.edge_right;
                    else if (n && w && e && !s) textureId = texVariant.edge_bottom;
                    else if (!n && !w && e && s) textureId = texVariant.outer_topleft;
                    else if (!n && w && !e && s) textureId = texVariant.outer_topright;
                    else if (!n && w && e && !s) textureId = texVariant.pipe_horizontal;
                    else if (n && !w && !e && s) textureId = texVariant.pipe_vertical;
                    else if (n && !w && e && !s) textureId = texVariant.outer_bottomleft;
                    else if (n && w && !e && !s) textureId = texVariant.outer_bottomright;
                    else if (!n && !w && !e && s) textureId = texVariant.pipe_top;
                    else if (!n && !w && e && !s) textureId = texVariant.pipe_left;
                    else if (!n && w && !e && !s) textureId = texVariant.pipe_right;
                    else if (n && !w && !e && !s) textureId = texVariant.pipe_bottom;
                    else textureId = texVariant.outer_all;

                    const config = new Thing.SpriteConfig(thisTileSprite.sprite.relX, thisTileSprite.sprite.relY, ...thisTileSprite.sprite.indices[textureId], thisTileSprite.sprite.width, thisTileSprite.sprite.height);

                    curRoomTiles.push(new Tile.Block(c * 10 + thisTile.offX, r * 10 + thisTile.offY, thisTile.w, thisTile.h,
                        sprMap.get(thisTileSprite.name), i.tiles[r][c], 0, config)
                    );
                }

                if (i.hazards[r][c] !== 0) {
                    const thisHazard = hazardTypes[i.hazards[r][c]];
                    curRoomHazards.push(new Tile.Hazard(c * 10 + thisHazard.offX, r * 10 + thisHazard.offY, thisHazard.w, thisHazard.h, false, i.hazards[r][c], thisHazard.facing));
                }

                if (i.decals[r][c] !== 0) {
                    const thisDecal = decalTypes[i.decals[r][c]];
                    curRoomDecals.push(new Tile.Decal(c * 10 + thisDecal.offX, r * 10 + thisDecal.offY, thisDecal.w, thisDecal.h, false, i.decals[r][c], thisDecal.z));
                }

                if (i.specials[r][c] !== 0) {
                    const thisSpecial = decalTypes[i.specials[r][c]];
                    curRoomSpecials.push(new Tile.Special(c * 10 + thisSpecial.offX, r * 10 + thisSpecial.offY, thisSpecial.w, thisSpecial.h, false, i.specials[r][c], thisSpecial.z));
                }

                if (i.triggers[r][c] !== 0) {
                    const thisTrigger = decalTypes[i.triggers[r][c]];
                    curRoomTriggers.push(new Thing.Trigger(c * 10 + thisTrigger.offX, r * 10 + thisTrigger.offY, thisTrigger.w, thisTrigger.h, () => {}));
                }
            }
        }

        rooms.push(new Room(i.id, i.width, i.height, i.x, i.y, curRoomTiles, curRoomHazards, curRoomDecals, curRoomSpecials, curRoomTriggers));

        for (const j of rooms) {
            if (j.x + j.width === i.x)
                rooms[i.id].connectLeft(j);
            if (j.x === i.x + i.width)
                rooms[i.id].connectRight(j);
            if (j.y + j.height === i.y)
                rooms[i.id].connectUp(j);
            if (j.y === i.y + i.height)
                rooms[i.id].connectDown(j);
        }
    }
}

function transition(direction) {
    loadRoom(rooms[curRoomId][direction].id);
    curRoomId = rooms[curRoomId][direction].id;
}

function transitionListener(e) {
    transition(e.detail);
}

function init() {
    loadLevel();
    curRoomId = 0;

    loadRoom(curRoomId);
    addEventListener("game_roomtransition", transitionListener);
}

export { level, curRoomId, rooms, decals, tiles, init }
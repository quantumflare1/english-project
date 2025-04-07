import * as Thing from "./thing.mjs";
import * as Tile from "./tile.mjs";
import tileSprites from "../data/tile/tiles.json" with { type: "json" };

class Room {
    id;
    width;
    height;
    tiles;
    hazards;
    decals;
    specials;
    triggers;
    rawTiles;
    x;
    y;
    up = null;
    down = null;
    left = null;
    right = null;

    /**
     * Creates a new room
     * @param {number} id The ID of this room
     * @param {number} w The width of this room in tiles
     * @param {number} h The height of this room in tiles
     * @param {number} x The X coordinate of this room in tiles
     * @param {number} y The Y coordinate of this room in tiles
     * @param {Tile.Block[]} tiles The tiles this room contains
     * @param {Tile.Hazard[]} hazards The hazards this room contains
     * @param {Tile.Decal[]} decals The decals this room contains
     * @param {Tile.Special[]} special The specials this room contains
     * @param {Tile.Trigger[]} triggers The triggers this room contains
     * @param {number[][]} rawTiles A 2D array of the tiles this room contains
     */
    constructor(id, w, h, x, y, tiles, hazards, decals, special, triggers, rawTiles) {
        this.id = id;
        this.width = w;
        this.height = h;
        this.tiles = tiles;
        this.hazards = hazards;
        this.decals = decals;
        this.specials = special;
        this.triggers = triggers;
        this.rawTiles = rawTiles;

        this.x = x;
        this.y = y;
    }
    /**
     * @param {Room} room The room above this one
     */
    connectUp(room) {
        this.up = room;
        room.down = this;
    }
    /**
     * @param {Room} room The room left of this one
     */
    connectLeft(room) {
        this.left = room;
        room.right = this;
    }
    /**
     * @param {Room} room The room below this one
     */
    connectDown(room) {
        this.down = room;
        room.up = this;
    }
    /**
     * @param {Room} room The room right of this one
     */
    connectRight(room) {
        this.right = room;
        room.left = this;
    }
    addToScene(scene) {
        for (const tile of this.tiles) tile.addToScene(scene);
        for (const decal of this.decals) decal.addToScene(scene);
        for (const hazard of this.hazards) hazard.addToScene(scene);
    }
    removeFromScene() {
        for (const tile of this.tiles) tile.removeFromScene();
        for (const decal of this.decals) decal.removeFromScene();
        for (const hazard of this.hazards) hazard.removeFromScene();
    }
}

class Level {
    rooms = [];
    curRoom = 0;
    scene; bg;

    /**
     * Creates a new level
     * @param {string} path A path to the level JSON 
     */
    constructor(path, scene) {
        this.scene = scene;
        this.init(path);
        addEventListener("game_roomtransition", (e) => { this.transition(e.detail); });
    }
    async init(path) {
        const json = await (await fetch(path)).json();

        const sprMap = new Map();
        Object.keys(tileSprites).forEach((v) => {
            Object.keys(tileSprites[v]).forEach((val) => {
                const img = new Image();
                img.src = tileSprites[v][val].sprite.src;
                sprMap.set(val, img);
            })
        });
        for (const i of json.rooms) {
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
                        const thisTileSprite = tileSprites.block[thisTile.sprite];
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
                        const e =  (c + 1 < i.width) ?                      i.tiles[r][c+1] > 0 : true;
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
    
                        const config = new Thing.SpriteConfig(...thisTileSprite.sprite.details[textureId]);
    
                        curRoomTiles.push(new Tile.Block(c * 10 + thisTile.offX, r * 10 + thisTile.offY, thisTile.w, thisTile.h,
                            sprMap.get(thisTile.sprite), i.tiles[r][c], 0, config)
                        );
                    }
    
                    if (i.hazards[r][c] !== 0) {
                        const thisHazard = hazardTypes[i.hazards[r][c]];
                        const thisHazardSprite = tileSprites.hazard[thisHazard.sprite];
                        const textureId = thisHazardSprite.sprite.texture[`facing_${thisHazard.facing}`];
                        const config = new Thing.SpriteConfig(...thisHazardSprite.sprite.details[textureId]);
                        curRoomHazards.push(new Tile.Hazard(c * 10 + thisHazard.offX, r * 10 + thisHazard.offY, thisHazard.w, thisHazard.h,
                            sprMap.get(thisHazard.sprite), i.hazards[r][c], thisHazard.facing, 1, config));
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
                        curRoomTriggers.push(new Tile.Trigger(c * 10 + thisTrigger.offX, r * 10 + thisTrigger.offY, thisTrigger.w, thisTrigger.h, () => {}));
                    }
                }
            }

            this.rooms.push(new Room(i.id, i.width, i.height, i.x, i.y, curRoomTiles, curRoomHazards, curRoomDecals, curRoomSpecials, curRoomTriggers, i.tiles));

            for (const j of this.rooms) {
                if (j.x + j.width === i.x)
                    this.rooms[i.id].connectLeft(j);
                if (j.x === i.x + i.width)
                    this.rooms[i.id].connectRight(j);
                if (j.y + j.height === i.y)
                    this.rooms[i.id].connectUp(j);
                if (j.y === i.y + i.height)
                    this.rooms[i.id].connectDown(j);
            }
        }

        this.loadRoom(this.curRoom);

        dispatchEvent(new Event("game_levelload"));
    }
    loadRoom(id) {
        this.curRoom = id;
        this.rooms[this.curRoom].addToScene(this.scene);
    }
    unloadRoom(id) {
        this.rooms[id].removeFromScene();
    }
    transition(direction) {
        this.unloadRoom(this.curRoom);
        this.loadRoom(this.rooms[this.curRoom][direction].id);
    }
}

const tileTypes = {
    1: {
        offX: 0,
        offY: 0,
        w: 10,
        h: 10,
        sprite: "grass"
    },
    2: {
        offX: 0,
        offY: 0,
        w: 10,
        h: 10,
        sprite: "temple"
    }
};

const hazardTypes = {
    1: {
        offX: 0,
        offY: 7,
        w: 10,
        h: 3,
        facing: "up",
        sprite: "spike"
    },
    2: {
        offX: 0,
        offY: 0,
        w: 10,
        h: 3,
        facing: "down",
        sprite: "spike"
    },
    3: {
        offX: 0,
        offY: 0,
        w: 3,
        h: 10,
        facing: "left",
        sprite: "spike"
    },
    4: {
        offX: 7,
        offY: 0,
        w: 3,
        h: 10,
        facing: "right",
        sprite: "spike"
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

export { Room, Level }
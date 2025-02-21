import * as Thing from "./thing.mjs";
import * as Tile from "./tile.mjs";
import level from "../data/level/level.json" with { type: "json" };

class Room {
    constructor(id, w, h, x, y, tiles, decals) {
        this.id = id;
        this.width = w;
        this.height = h;
        this.tiles = tiles;
        this.decals = decals;

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

const tileTypes = {
    1: {
        offX: 0,
        offY: 0,
        w: 10,
        h: 10,
        type: "Block"
    },
    2: {
        offX: 0,
        offY: 7,
        w: 10,
        h: 3,
        type: "Hazard"
    }
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

function loadLevel() {
    for (const i of level.rooms) {

        // preprocess room data
        const curRoomTiles = [];
        const curRoomDecals = [];
        for (let r = 0; r < i.height; r++) {
            for (let c = 0; c < i.width; c++) {
                if (i.tiles[r][c] !== 0) {
                    const thisTile = tileTypes[i.tiles[r][c]];
                    curRoomTiles.push(new Tile[thisTile.type](c * 10 + thisTile.offX, r * 10 + thisTile.offY, thisTile.w, thisTile.h, i.tiles[r][c]));
                }
            }
        }
        for (let r = 0; r < i.height; r++) {
            for (let c = 0; c < i.width; c++) {
                if (i.decals[r][c] !== 0) {
                    const thisDecal = decalTypes[i.decals[r][c]];
                    curRoomDecals.push(new Tile.Decal(c * 10 + thisDecal.offX, r * 10 + thisDecal.offY, thisDecal.w, thisDecal.h, i.decals[r][c], thisDecal.z));
                }
            }
        }

        rooms.push(new Room(i.id, i.width, i.height, i.x, i.y, curRoomTiles, curRoomDecals));

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
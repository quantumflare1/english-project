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
const rooms = [];
let curRoomId;

const tileTypes = {
    1: {
        offX: 0,
        offY: 0,
        w: 10,
        h: 10,
        c: "black"
    },
    2: {
        offX: 0,
        offY: 7,
        w: 10,
        h: 3,
        c: "blue"
    }
};

function loadRoom(id) {
    tiles.splice(0);
    for (let i = 0; i < rooms[id].height; i++) {
        for (let j = 0; j < rooms[id].width; j++) {
            if (rooms[id].tiles[i][j] !== 0) {
                const thisTile = tileTypes[rooms[id].tiles[i][j]];
                tiles.push(new Tile.Block(j * 10 + thisTile.offX, i * 10 + thisTile.offY, thisTile.w, thisTile.h, thisTile.c, rooms[id].tiles[i][j]));
            }
        }
    }
}

function loadLevel() {
    for (const i of level.rooms) {
        rooms.push(new Room(i.id, i.width, i.height, i.x, i.y, i.tiles, i.decals));

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

export { level, curRoomId, rooms, tiles, init }
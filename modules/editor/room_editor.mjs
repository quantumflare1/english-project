import Scene from "../scene.mjs";
import Camera from "../node/camera.mjs";
import RoomData from "./room.mjs";
import Entity from "../node/entity.mjs";
import Sprite from "../node/sprite.mjs";
import Rect from "../node/rect.mjs";
import Vector from "../misc/vector.mjs";
import Assets from "../assets.mjs";
import Mouse from "./mouse.mjs";
import Room from "../node/room.mjs";

import { CameraSnapEvent, EditorImportEvent, EditorRoomChangeEvent, EditorTileSelectEvent, SceneLoadEvent } from "../event.mjs";

import tiles from "../../data/img/tile/tile.json" with { type: "json" };
import RoomBG from "./room_bg.mjs";
import { input } from "../inputs.mjs";

const MAX_BOUND = 1000;

export default class Editor extends Scene {
    canvas;
    mouse;
    level; room;
    curTile; curType;
    blockMap; hazardMap; decalMap; specialMap; triggerMap;
    roomIndicators;
    state;
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {Mouse} mouse 
     */
    constructor(mouse, canvas) {
        super("editor", new Camera(0, 0, 0.6), new Room(-MAX_BOUND, -MAX_BOUND, MAX_BOUND * 2, MAX_BOUND * 2, 0));
        this.mouse = mouse;
        this.canvas = canvas;
        this.room = new RoomData(0, RoomData.DEFAULT_WIDTH, RoomData.DEFAULT_HEIGHT, 0, 0);
        this.level = {
            meta: {
                name: "default",
                spawnRoom: 0,
                spawnX: 0,
                spawnY: 0,
                playerState: 0
            },
            rooms: [ this.room ]
        };
        this.state = "level";

        this.blockMap = new Map();
        this.hazardMap = new Map();
        this.decalMap = new Map();
        this.triggerMap = new Map();
        this.specialMap = new Map();

        for (let i = 0; i < tiles.block.length; i++)
            this.blockMap.set(tiles.block[i].name, i+1);
        for (let i = 0; i < tiles.hazard.length; i++)
            this.hazardMap.set(`${tiles.hazard[i].name}_${tiles.hazard[i].facing}`, i+1);
        for (let i = 0; i < tiles.decal.length; i++)
            this.decalMap.set(tiles.decal[i].name, i+1);
        for (let i = 0; i < tiles.special.length; i++)
            this.specialMap.set(tiles.special[i].name, i+1);
        for (let i = 0; i < tiles.trigger.length; i++)
            this.triggerMap.set(tiles.trigger[i].name, i+1);

        addEventListener(EditorTileSelectEvent.code, (e) => {
            this.curTile = e.detail.name;
            this.curType = e.detail.type;
        });
        addEventListener("mousemove", this.moveCamera.bind(this));

        this.roomIndicators = [new RoomBG(this.room?.x, this.room?.y, this.room?.width, this.room?.height, 0)];
        this.roomIndicators[0].fancy = true;

        this.addNode(this.roomIndicators[this.room?.id]);

        dispatchEvent(new SceneLoadEvent());
    }
    placeTile(pos, type) {
        if (type === "hazard") {
            const globalPos = new Vector(pos.x + this.room?.x, pos.y + this.room?.y);
            globalPos.multiply(40);
            const thisHazard = tiles.hazard[this.room?.hazards[pos.y][pos.x]-1];
            const thisHazardSprite = Assets.sprites[thisHazard.name];

            let textureId = thisHazardSprite.name[`facing_${thisHazard.facing}`];;
            const pixelPos = new Vector(globalPos.x + thisHazard.offX, globalPos.y + thisHazard.offY);
            const texDetails = thisHazardSprite.sprite[textureId];

            const entity = new Entity(pixelPos.x, pixelPos.y,
                new Rect(pixelPos.x, pixelPos.y, thisHazard.w, thisHazard.h), new Sprite(
                pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisHazard.z,
                new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
            1));

            this.addNode(entity);
        }
        else if (type !== "trigger") {
            const globalPos = new Vector(pos.x + this.room?.x, pos.y + this.room?.y);
            globalPos.multiply(40);
            const thisBlock = tiles[type][this.room?.[`${type}s`][pos.y][pos.x]-1];
            const thisBlockSprite = Assets.sprites[thisBlock.name];

            let textureId = 0;
            const pixelPos = new Vector(globalPos.x + thisBlock.offX, globalPos.y + thisBlock.offY);
            const texDetails = thisBlockSprite.sprite[textureId];

            const entity = new Entity(pixelPos.x, pixelPos.y,
                new Rect(pixelPos.x, pixelPos.y, thisBlock.w, thisBlock.h), new Sprite(
                pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisBlock.z,
                new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
            1))

            this.addNode(entity);
        }
    }
    moveCamera() {
        if (this.mouse.pressed.has(1) || (this.state === "level" && this.mouse.pressed.has(2))) {
            dispatchEvent(new CameraSnapEvent(this.camera.pos.x - this.mouse.movement.x, this.camera.pos.y - this.mouse.movement.y));
        }
    }
    update() {
        const mouseTile = new Vector(Math.floor((this.mouse.pos.x + this.camera.pos.x) / (40 * this.camera.zoom)) - this.room?.x, Math.floor((this.mouse.pos.y + this.camera.pos.y) / (40 * this.camera.zoom) - this.room?.y));
        
        if (this.mouse.pressed.has(0)) {
            if (this.curTile && this.state === "room") {
                if (mouseTile.x >= 0 && mouseTile.x < this.room?.width && mouseTile.y >= 0 && mouseTile.y < this.room?.height && this.room[`${this.curType}s`][mouseTile.y][mouseTile.x] === 0) {
                    this.room[`${this.curType}s`][mouseTile.y][mouseTile.x] = this[`${this.curType}Map`].get(this.curTile);

                    this.placeTile(mouseTile, this.curType);
                }
            }
            else if (this.state === "level") {
                for (const i of this.nodes) {
                    if ("hovering" in i && i.hovering) {
                        if (this.room) this.roomIndicators[this.room?.id].fancy = false;
                        this.room = this.level.rooms[i.id];
                        i.fancy = true;
                        dispatchEvent(new EditorRoomChangeEvent());
                        break;
                    }
                }
            }
        }
        else if (this.mouse.pressed.has(2)) {
            if (this.curType && this.state === "room") {
                if (mouseTile.x >= 0 && mouseTile.x < this.room?.width && mouseTile.y >= 0 && mouseTile.y < this.room?.height && this.room?.[`${this.curType}s`][mouseTile.y][mouseTile.x] > 0) {
                    const thisTile = tiles[this.curType][this.room?.[`${this.curType}s`][mouseTile.y][mouseTile.x]-1];
                    const tilePos = new Vector(mouseTile.x * 40 + thisTile.offX + this.room?.x * 40, mouseTile.y * 40 + thisTile.offY + this.room?.y * 40);

                    this.room[`${this.curType}s`][mouseTile.y][mouseTile.x] = 0;
                    this.removeNode(this.findObjectWithProperty(this.nodes, { key: "pos", value: tilePos }, { key: "hitbox", value: new Rect(tilePos.x, tilePos.y, thisTile.w, thisTile.h) }));
                }
            }
        }
        if (this.state === "level" && input.impulse.has("delete")) {
            for (const i of this.nodes) {
                if ("fancy" in i && i.fancy) {
                    for (const node of this.nodes) { // inefficient and slow please patch this later (also visually broken?)
                        if (node instanceof Entity && i.collidesWith(node.hitbox)) {
                            this.removeNode(node);
                        }
                    }

                    this.level.rooms.splice(this.room?.id, 1);
                    this.roomIndicators.splice(this.room?.id, 1);

                    if (i.id === this.room?.id) {
                        this.room = this.level.rooms[0];
                        this.roomIndicators[0].fancy = true;
                        dispatchEvent(new EditorRoomChangeEvent());
                    } else if (this.room) {
                        this.room.id = i.id;
                    }

                    this.removeNode(i);

                    break;
                }
            }
            input.consumeInput("delete");
        }

        if (this.state === "level") {
            for (const i of this.nodes) {
                if ("hovering" in i) i.hovering = i.collidesWith(new Rect((this.mouse.pos.x + this.camera.pos.x) / this.camera.zoom, (this.mouse.pos.y + this.camera.pos.y) / this.camera.zoom, 1, 1));
            }
        }
    }
    editMeta(meta, value) {
        this.level.meta[meta] = value;
    }
    editRoom(detail, value) {
        this.room[detail] = value;
        switch (detail) {
            case "x":
            case "y":
                this.roomIndicators[this.room?.id].pos[detail] = value * 40;
                break;
            case "width":
                this.roomIndicators[this.room?.id].dimensions.x = value * 40;

                for (let i = 0; i < this.room.height; i++) {
                    for (let j = this.room.blocks[i].length; j < this.room.width; j++)
                        this.room.blocks[i][j] = 0;
                    for (let j = this.room.hazards[i].length; j < this.room.width; j++)
                        this.room.hazards[i][j] = 0;
                    for (let j = this.room.decals[i].length; j < this.room.width; j++)
                        this.room.decals[i][j] = 0;
                    for (let j = this.room.triggers[i].length; j < this.room.width; j++)
                        this.room.triggers[i][j] = 0;
                    for (let j = this.room.specials[i].length; j < this.room.width; j++)
                        this.room.specials[i][j] = 0;
                }
                break;
            case "height":
                this.roomIndicators[this.room?.id].dimensions.y = value * 40;

                for (let i = this.room.blocks.length; i < this.room.height; i++) {
                    this.room.blocks[i] = [];
                    for (let j = 0; j < this.room.width; j++)
                        this.room.blocks[i][j] = 0;
                    this.room.hazards[i] = [];
                    for (let j = 0; j < this.room.width; j++)
                        this.room.hazards[i][j] = 0;
                    this.room.decals[i] = [];
                    for (let j = 0; j < this.room.width; j++)
                        this.room.decals[i][j] = 0;
                    this.room.triggers[i] = [];
                    for (let j = 0; j < this.room.width; j++)
                        this.room.triggers[i][j] = 0;
                    this.room.specials[i] = [];
                    for (let j = 0; j < this.room.width; j++)
                        this.room.specials[i][j] = 0;
                }
                break;
        }
    }
    createRoom() {
        const room = new RoomData(this.level.rooms.length, RoomData.DEFAULT_WIDTH, RoomData.DEFAULT_HEIGHT, Math.floor(this.camera.pos.x / (40 * this.camera.zoom)), Math.floor(this.camera.pos.y / (40 * this.camera.zoom)));
        if (this.room) this.roomIndicators[this.room.id].fancy = false;
        
        this.room = room;
        this.level.rooms.push(room);
        this.roomIndicators.push(new RoomBG(room.x, room.y, room.width, room.height, room.id));
        this.roomIndicators[this.room?.id].fancy = true;
        this.addNode(this.roomIndicators[this.roomIndicators.length-1]);
        dispatchEvent(new EditorRoomChangeEvent());
    }
    importLevel(newLevel) {
        this.level = newLevel;
        this.roomIndicators.length = 0;
        this.nodes.forEach((v) => {
            this.nodes.delete(v);
        });
        
        for (const room of newLevel.rooms) {
            this.room = room;
            this.roomIndicators.push(new RoomBG(room.x, room.y, room.width, room.height, room.id));
            this.addNode(this.roomIndicators[this.roomIndicators.length-1]);

            for (let i = 0; i < room.height; i++) {
                for (let j = 0; j < room.width; j++) {
                    if (room.blocks[i][j] !== 0) {
                        this.placeTile(new Vector(j, i), "block");
                    }
                    if (room.hazards[i][j] !== 0) {
                        this.placeTile(new Vector(j, i), "hazard");
                    }
                    if (room.decals[i][j] !== 0) {
                        this.placeTile(new Vector(j, i), "decal");
                    }
                    if (room.specials[i][j] !== 0) {
                        this.placeTile(new Vector(j, i), "special");
                    }
                    if (room.triggers[i][j] !== 0) {
                        this.placeTile(new Vector(j, i), "trigger");
                    }
                }
            }
        }
        this.room = newLevel.rooms[0];
        console.log(newLevel.rooms)
        this.roomIndicators[this.room.id].fancy = true;

        dispatchEvent(new EditorImportEvent(newLevel.meta));
    }
    findObjectWithProperty(arr, ...kvPairs) {
        for (const i of arr) {
            let matchingPairs = 0;
            for (const j of kvPairs) {
                if (!(j.key in i)) break;
                if (!i[j.key].equals(j.value)) break;
                matchingPairs++;
                if (matchingPairs === kvPairs.length)
                    return i;
            }
        }
        return null;
    }
    findObjectOfType(arr, type) {
        for (const i of arr) {
            if (i instanceof type) return i;
        }
        return null;
    }
}
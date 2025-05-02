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

import { CameraSnapEvent, SceneLoadEvent } from "../event.mjs";

import tiles from "../../data/img/tile/tile.json" with { type: "json" };
import RoomBG from "./room_bg.mjs";

const MAX_BOUND = 1000;

export default class Editor extends Scene {
    canvas;
    mouse;
    level; room;
    selectedTile; selectedType;
    blockMap; hazardMap; decalMap;
    roomIndicators;
    state;
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {Mouse} mouse 
     */
    constructor(mouse, canvas) {
        super("editor", new Camera(0, 0, 0.5), new Room(-MAX_BOUND, -MAX_BOUND, MAX_BOUND * 2, MAX_BOUND * 2, 0));
        this.mouse = mouse;
        this.canvas = canvas;
        this.room = new RoomData(0, RoomData.DEFAULT_WIDTH, RoomData.DEFAULT_HEIGHT, 0, 0);
        this.level = {
            meta: {
                name: "default",
                spawnRoom: 0
            },
            rooms: [ this.room ]
        };
        this.state = "level";

        this.blockMap = new Map();
        this.hazardMap = new Map();
        this.decalMap = new Map();

        for (let i = 0; i < tiles.block.length; i++)
            this.blockMap.set(tiles.block[i].name, i+1);
        for (let i = 0; i < tiles.hazard.length; i++)
            this.hazardMap.set(`${tiles.hazard[i].name}_${tiles.hazard[i].facing}`, i+1);
        for (let i = 0; i < tiles.decal.length; i++)
            this.decalMap.set(tiles.decal[i].name, i+1);

        addEventListener("editor_tileselect", (e) => {
            this.selectedTile = e.detail.name;
            this.selectedType = e.detail.type;
        });

        this.roomIndicators = [new RoomBG(this.room?.x, this.room?.y, this.room?.width, this.room?.height, 0)];
        this.roomIndicators[0].fancy = true;

        this.addNode(this.roomIndicators[this.room?.id]);

        dispatchEvent(new SceneLoadEvent());
    }
    update() {
        if (this.mouse.pressed.has(1)) {
            dispatchEvent(new CameraSnapEvent(this.camera.pos.x - 2 * this.mouse.movement.x, this.camera.pos.y - 2 * this.mouse.movement.y));
        }

        const mouseTile = new Vector(Math.floor((this.mouse.pos.x + this.camera.pos.x) / (10 * this.camera.zoom)) - this.room?.x, Math.floor((this.mouse.pos.y + this.camera.pos.y) / (10 * this.camera.zoom) - this.room?.y));
        
        if (this.mouse.pressed.has(0)) {
            if (this.selectedTile && this.state === "room") {
                if (mouseTile.x >= 0 && mouseTile.x < this.room?.width && mouseTile.y >= 0 && mouseTile.y < this.room?.height && this.room[`${this.selectedType}s`][mouseTile.y][mouseTile.x] === 0) {
                    this.room[`${this.selectedType}s`][mouseTile.y][mouseTile.x] = this[`${this.selectedType}Map`].get(this.selectedTile);

                    if (this.selectedType === "hazard") {
                        const globalPos = new Vector(mouseTile.x + this.room?.x, mouseTile.y + this.room?.y);
                        globalPos.multiply(10);
                        const thisHazard = tiles.hazard[this.room?.hazards[mouseTile.y][mouseTile.x]-1];
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
                    else {
                        const globalPos = new Vector(mouseTile.x + this.room?.x, mouseTile.y + this.room?.y);
                        globalPos.multiply(10);
                        const thisBlock = tiles[this.selectedType][this.room?.[`${this.selectedType}s`][mouseTile.y][mouseTile.x]-1];
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
            }
            else if (this.state === "level") {
                for (const i of this.nodes) {
                    if ("hovering" in i && i.hovering) {
                        this.roomIndicators[this.room?.id].fancy = false;
                        this.room = this.level.rooms[i.id];
                        i.fancy = true;
                        dispatchEvent(new Event("editor_changeroom"));
                        break;
                    }
                }
            }
        }
        else if (this.mouse.pressed.has(2)) {
            if (this.selectedType && this.state === "room") {
                if (mouseTile.x >= 0 && mouseTile.x < this.room?.width && mouseTile.y >= 0 && mouseTile.y < this.room?.height && this.room?.[`${this.selectedType}s`][mouseTile.y][mouseTile.x] > 0) {
                    const thisTile = tiles[this.selectedType][this.room?.[`${this.selectedType}s`][mouseTile.y][mouseTile.x]-1];
                    const tilePos = new Vector(mouseTile.x * 10 + thisTile.offX + this.room?.x * 10, mouseTile.y * 10 + thisTile.offY + this.room?.y * 10);

                    this.room[`${this.selectedType}s`][mouseTile.y][mouseTile.x] = 0;
                    this.removeNode(this.findObjectWithProperty(this.nodes, { key: "pos", value: tilePos }));
                }
            }
            else if (this.state === "level") {
                for (const i of this.nodes) {
                    if ("hovering" in i && i.hovering) {
                        this.level.rooms.splice(this.room?.id, 1);
                        this.roomIndicators.splice(this.room?.id, 1);

                        if (i.id === this.room?.id) {
                            this.room = null;
                            dispatchEvent(new Event("editor_changeroom"));
                        } else {
                            this.room.id = i.id;
                        }

                        this.removeNode(i);
                        break;
                    }
                }
            }
            /*
                                    const thisHazard = tiles.hazard[room.hazards[r][c]-1];
                        const thisHazardSprite = Assets.sprites[thisHazard.name];
                        const textureId = thisHazardSprite.name[`facing_${thisHazard.facing}`];
                        const texDetails = thisHazardSprite.sprite[textureId];
                        const pixelPos = new Vector(globalPos.x + thisHazard.offX, globalPos.y + thisHazard.offY);
                        //console.log(texDetails)
                        
                        const hazardRect = new Hazard(pixelPos.x, pixelPos.y, thisHazard.w, thisHazard.h, thisHazard.facing);
                        this.addNode(new Entity(pixelPos.x, pixelPos.y, hazardRect, new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisHazard.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1)));
            */
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
                this.roomIndicators[this.room?.id].pos[detail] = value * 10;
                break;
            case "width":
                this.roomIndicators[this.room?.id].dimensions.x = value * 10;
                break;
            case "height":
                this.roomIndicators[this.room?.id].dimensions.y = value * 10;
                break;
        }
    }
    createRoom() {
        console.log("yea")
        const room = new RoomData(this.level.rooms.length, RoomData.DEFAULT_WIDTH, RoomData.DEFAULT_HEIGHT, Math.floor(this.camera.pos.x / (10 * this.camera.zoom)), Math.floor(this.camera.pos.y / (10 * this.camera.zoom)));
        if (this.room) this.roomIndicators[this.room.id].fancy = false;
        
        this.room = room;
        this.level.rooms.push(room);
        this.roomIndicators.push(new RoomBG(room.x, room.y, room.width, room.height, room.id));
        this.roomIndicators[this.room?.id].fancy = true;
        this.addNode(this.roomIndicators[this.roomIndicators.length-1]);
        dispatchEvent(new Event("editor_changeroom"));
    }
    findObjectWithProperty(arr, ...kvPairs) {
        for (const i of arr) {
            let matchingPairs = 0;
            for (const j of kvPairs) {
                if (!i[j.key].equals(j.value)) break;
                matchingPairs++;
                if (matchingPairs === kvPairs.length)
                    return i;
            }
        }
        return null;
    }
}
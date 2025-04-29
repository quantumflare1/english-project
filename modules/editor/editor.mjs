import Mouse from "./mouse.mjs";
import Scene from "../scene.mjs";
import Camera from "../node/camera.mjs";
import RoomData from "./room.mjs";
import Room from "../node/room.mjs";
import Entity from "../node/entity.mjs";
import Sprite from "../node/sprite.mjs";
import Hazard from "../node/hazard.mjs";
import Rect from "../node/rect.mjs";
import Vector from "../misc/vector.mjs";
import Assets from "../assets.mjs";

import { CameraSnapEvent, SceneLoadEvent } from "../event.mjs";

import tiles from "../../data/img/tile/tile.json" with { type: "json" };

export default class Editor extends Scene {
    canvas; ctx;
    mouse;
    level; curRoom;
    selectedTile; selectedType;
    blockMap; hazardMap; decalMap;
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {CanvasRenderingContext2D} ctx 
     */
    constructor(canvas, ctx) {
        super("editor", new Camera(0, 0, 1));
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = new Mouse(canvas);
        this.level = {
            meta: {
                name: "",
                spawnRoom: 0
            },
            rooms: [
                new RoomData(0, 40, 20, 0, 0)
            ]
        };
        this.blockMap = new Map();
        this.hazardMap = new Map();
        this.decalMap = new Map();
        this.curRoom = 0;

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

        dispatchEvent(new SceneLoadEvent());
    }
    update() {
        if (this.mouse.pressed.has(1)) dispatchEvent(new CameraSnapEvent(this.camera.pos.x + this.mouse.movement.x, this.camera.pos.y + this.mouse.movement.y));
        
        if (this.mouse.pressed.has(0)) {
            if (this.selectedTile) {
                const room = this.level.rooms[this.curRoom];
                const mouseTile = new Vector(Math.floor(this.mouse.pos.x / 10), Math.floor(this.mouse.pos.y / 10));

                if (room[`${this.selectedType}s`][mouseTile.y][mouseTile.x] === 0) {
                    room[`${this.selectedType}s`][mouseTile.y][mouseTile.x] = this[`${this.selectedType}Map`].get(this.selectedTile);

                    if (this.selectedType === "hazard") {
                        const globalPos = new Vector(mouseTile.x + room.x, mouseTile.y + room.y);
                        globalPos.multiply(10);
                        const thisHazard = tiles.hazard[room.hazards[mouseTile.y][mouseTile.x]-1];
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
                        const globalPos = new Vector(mouseTile.x + room.x, mouseTile.y + room.y);
                        globalPos.multiply(10);
                        const thisBlock = tiles[this.selectedType][room[`${this.selectedType}s`][mouseTile.y][mouseTile.x]-1];
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
        }
        else if (this.mouse.pressed.has(2)) {
            if (this.selectedType) {
                const mouseTile = new Vector(Math.floor(this.mouse.pos.x / 10), Math.floor(this.mouse.pos.y / 10));
                const room = this.level.rooms[this.curRoom];

                if (room[`${this.selectedType}s`][mouseTile.y][mouseTile.x] > 0) {
                    const thisTile = tiles[this.selectedType][room[`${this.selectedType}s`][mouseTile.y][mouseTile.x]-1];
                    const tilePos = new Vector(mouseTile.x * 10 + thisTile.offX, mouseTile.y * 10 + thisTile.offY);

                    this.level.rooms[this.curRoom][`${this.selectedType}s`][mouseTile.y][mouseTile.x] = 0;
                    this.removeNode(this.findObjectWithProperty(this.nodes, { key: "pos", value: tilePos }));
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
import Room from "./node/room.mjs";
import Scene from "./scene.mjs";
import Camera from "./node/camera.mjs";
import Entity from "./node/entity.mjs";
import Sprite from "./node/sprite.mjs";
import Rect from "./node/rect.mjs";
import Hazard from "./node/hazard.mjs";
import Assets from "./assets.mjs";
import Vector from "./misc/vector.mjs";
import Player from "./node/player.mjs";
import Text from "./node/text.mjs";
import Trigger from "./node/trigger.mjs";
import Special from "./node/special.mjs";

import tiles from "../data/img/tile/tile.json" with { type: "json" };
import { options } from "./options.mjs";
import * as triggers from "./scripts.mjs";

class Level extends Scene {
    blockList = [];
    hazardList = [];
    triggerList = [];
    specialList = [];

    roomBlocks = [];

    constructor(path) {
        super("placeholder", new Camera(0, 0, 1));
        this.init(path);
    }
    async init(path) {
        const json = await (await fetch(path)).json();
    
        const rooms = [];
        // preprocess room data
        for (const i of json.rooms) {
            this.roomBlocks.push(i.blocks);
            for (let r = 0; r < i.height; r++) {
                for (let c = 0; c < i.width; c++) {
                    const globalPos = new Vector(c + i.x, r + i.y);
                    globalPos.multiply(10);
    
                    if (i.blocks[r][c] !== 0) {
                        const thisBlock = tiles.block[i.blocks[r][c]-1];
                        const thisBlockSprite = Assets.sprites[thisBlock.name];
                        let textureId = 0;
    
                        const nw = (c - 1 >= 0 && r - 1 >= 0) ?             i.blocks[r-1][c-1] > 0 : true;
                        const n =  (r - 1 >= 0) ?                           i.blocks[r-1][c] > 0 : true;
                        const ne = (c + 1 < i.width && r - 1 >= 0) ?        i.blocks[r-1][c+1] > 0 : true;
                        const e =  (c + 1 < i.width) ?                      i.blocks[r][c+1] > 0 : true;
                        const se = (c + 1 < i.width && r + 1 < i.height) ?  i.blocks[r+1][c+1] > 0 : true;
                        const s =  (r + 1 < i.height) ?                     i.blocks[r+1][c] > 0 : true;
                        const sw = (c - 1 >= 0 && r + 1 < i.height) ?       i.blocks[r+1][c-1] > 0 : true;
                        const w =  (c - 1 >= 0) ?                           i.blocks[r][c-1] > 0 : true;

                        const texVariant = thisBlockSprite.name;
    
                        // very readable autotiling code
                        if (nw && n && ne && e && se && s && sw && w) textureId = texVariant.inner;
                        else if (!n && e && se && s && sw && w) textureId = texVariant.top;
                        else if (n && ne && e && se && s && !w) textureId = texVariant.left;
                        else if (nw && n && !e && s && sw && w) textureId = texVariant.right;
                        else if (nw && n && ne && e && !s && w) textureId = texVariant.bottom;
                        else if (!n && e && se && s && !w) textureId = texVariant.topleft;
                        else if (!n && !e && s && sw && w) textureId = texVariant.topright;
                        else if (n && ne && e && !s && !w) textureId = texVariant.bottomleft;
                        else if (nw && n && !e && !s && w) textureId = texVariant.bottomright;
                        else if (!n && e && !s && w) textureId = texVariant.pipe_horizontal;
                        else if (n && !e && s && !w) textureId = texVariant.pipe_vertical;
                        else if (!n && !e && s && !w) textureId = texVariant.pipe_top;
                        else if (!n && e && !s && !w) textureId = texVariant.pipe_left;
                        else if (!n && !e && !s && w) textureId = texVariant.pipe_right;
                        else if (n && !e && !s && !w) textureId = texVariant.pipe_bottom;
                        else if (!n && e && !se && s && !w) textureId = texVariant.pipe_topleft;
                        else if (!n && !e && s && !sw && w) textureId = texVariant.pipe_topright;
                        else if (n && !ne && e && !s && !w) textureId = texVariant.pipe_bottomleft;
                        else if (!nw && n && !e && !s && w) textureId = texVariant.pipe_bottomright;
                        else if (nw && n && ne && e && !se && s && sw && w) textureId = texVariant.inner_bottomright;
                        else if (nw && n && ne && e && se && s && !sw && w) textureId = texVariant.inner_bottomleft;
                        else if (!nw && n && ne && e && se && s && sw && w) textureId = texVariant.inner_topleft;
                        else if (nw && n && !ne && e && se && s && sw && w) textureId = texVariant.inner_topright;
                        else if (nw && n && ne && e && !se && s && !sw && w) textureId = texVariant.pipe_base_bottom;
                        else if (!nw && n && ne && e && se && s && !sw && w) textureId = texVariant.pipe_base_left;
                        else if (nw && n && !ne && e && !se && s && sw && w) textureId = texVariant.pipe_base_right;
                        else if (!nw && n && !ne && e && se && s && sw && w) textureId = texVariant.pipe_base_top;
                        else if (nw && n && !ne && e && !se && s && !sw && w) textureId = texVariant.triplecorner_bottomright;
                        else if (!nw && n && ne && e && !se && s && !sw && w) textureId = texVariant.triplecorner_bottomleft;
                        else if (!nw && n && !ne && e && se && s && !sw && w) textureId = texVariant.triplecorner_topleft;
                        else if (!nw && n && !ne && e && !se && s && sw && w) textureId = texVariant.triplecorner_topright;
                        else if (n && !ne && e && se && s && !w) textureId = texVariant.left_corner_top;
                        else if (n && ne && e && !se && s && !w) textureId = texVariant.left_corner_bottom;
                        else if (n && !ne && e && !se && s && !w) textureId = texVariant.left_corner_both;
                        else if (!nw && n && !e && s && sw && w) textureId = texVariant.right_corner_top;
                        else if (nw && n && !e && s && !sw && w) textureId = texVariant.right_corner_bottom;
                        else if (!nw && n && !e && s && !sw && w) textureId = texVariant.right_corner_both;
                        else if (!n && e && se && s && !sw && w) textureId = texVariant.top_corner_left;
                        else if (!n && e && !se && s && sw && w) textureId = texVariant.top_corner_right;
                        else if (!n && e && !se && s && !sw && w) textureId = texVariant.top_corner_both;
                        else if (!nw && n && ne && e && !s && w) textureId = texVariant.bottom_corner_left;
                        else if (nw && n && !ne && e && !s && w) textureId = texVariant.bottom_corner_right;
                        else if (!nw && n && !ne && e && !s && w) textureId = texVariant.bottom_corner_both;
                        else if (!nw && n && ne && e && !se && s && sw && w) textureId = texVariant.corner_opposite_left;
                        else if (nw && n && !ne && e && se && s && !sw && w) textureId = texVariant.corner_opposite_right;
                        else textureId = texVariant.outer_all;
    
                        const pixelPos = new Vector(globalPos.x + thisBlock.offX, globalPos.y + thisBlock.offY);
                        const texDetails = thisBlockSprite.sprite[textureId];
    
                        // incomprehensible
                        const blockRect = new Rect(pixelPos.x, pixelPos.y, thisBlock.w, thisBlock.h);
                        this.addNode(new Entity(pixelPos.x, pixelPos.y, blockRect, new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisBlock.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1)));
                        this.blockList.push(blockRect);
                    }
    
                    if (i.hazards[r][c] !== 0) {
                        const thisHazard = tiles.hazard[i.hazards[r][c]-1];
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
                        this.hazardList.push(hazardRect);
                    }
    
                    if (i.decals[r][c] !== 0) {
                        const thisDecal = tiles.decal[i.decals[r][c]-1];
                        const thisDecalSprite = Assets.sprites[thisDecal.name];
                        const textureId = thisDecalSprite.name.default; // placeholder!!
                        const texDetails = thisDecalSprite.sprite[textureId];
                        const pixelPos = new Vector(globalPos.x + thisDecal.offX, globalPos.y + thisDecal.offY);
                        
                        this.addNode(new Entity(pixelPos.x, pixelPos.y, new Rect(
                            pixelPos.x, pixelPos.y, thisDecal.w, thisDecal.h
                        ), new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisDecal.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1)));
                    }

                    if (i.triggers[r][c] !== 0) {
                        const thisTrigger = tiles.trigger[i.triggers[r][c]-1];
                        const pixelPos = new Vector(globalPos.x + thisTrigger.offX, globalPos.y + thisTrigger.offY);
                        
                        const triggerRect = new Trigger(pixelPos.x, pixelPos.y, thisTrigger.w, thisTrigger.h, thisTrigger.trigger, thisTrigger.type, thisTrigger.maxActivations, triggers[thisTrigger.name]);

                        if (thisTrigger.sprite) {
                            const thisTriggerSprite = Assets.sprites[thisTrigger.sprite.name];
                            const textureId = thisTriggerSprite.name.default; // placeholder!!
                            const texDetails = thisTriggerSprite.sprite[textureId];

                            this.addNode(new Entity(pixelPos.x, pixelPos.y, triggerRect, new Sprite(
                                pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisTrigger.z,
                                new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                            1)));
                        }
                        else {
                            this.addNode(triggerRect);
                        }
                        this.triggerList.push(triggerRect);
                    }

                    if (i.specials[r][c] !== 0) {
                        const thisSpecial = tiles.special[i.specials[r][c]-1];
                        const pixelPos = new Vector(globalPos.x + thisSpecial.offX, globalPos.y + thisSpecial.offY);
                        
                        const thisSpecialSprite = Assets.sprites[thisSpecial.name];
                        const textureId = thisSpecialSprite.name.default; // placeholder!!
                        const texDetails = thisSpecialSprite.sprite[textureId];

                        console.log(texDetails)
                        const special = new Special(pixelPos.x, pixelPos.y, new Rect(
                            pixelPos.x, pixelPos.y, thisSpecial.w, thisSpecial.h), new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisSpecial.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1), ...thisSpecial.functions)

                        this.addNode(special);
                        
                        this.specialList.push(special);
                    }
                }
            }
    
            const thisRoom = new Room(i.x, i.y, i.width, i.height, i.id);
    
            for (const j of rooms) {
                if (j.pos.x + j.dimensions.x === i.x)
                    thisRoom.connect(j, "left");
                if (j.pos.x === i.x + i.width)
                    thisRoom.connect(j, "right");
                if (j.pos.y + j.dimensions.y === i.y)
                    thisRoom.connect(j, "up");
                if (j.pos.y === i.y + i.height)
                    thisRoom.connect(j, "down");
            }
    
            rooms.push(thisRoom);
        }
        this.addRooms(...rooms);
        this.addNode(new Player(30, 0, this));

        if (options.showFps) {
            const fpsDisplay = new Text(5, 14, 100, "60 FPS", "start", "12px font-Pixellari", "white", "follow");

            addEventListener("ui_fpschange", (e) => {
                fpsDisplay.text = e.detail + " FPS";
            });
            this.addNode(fpsDisplay);
        }
        if (options.showTimer) {
            const timerDisplay = new Text(315, 14, 100, "0.00", "end", "12px font-Pixellari", "white", "follow");
            timerDisplay.ms = 0; // secret hardcoded hack
            timerDisplay.startMs = document.timeline.currentTime;

            addEventListener("ui_timechange", (e) => {
                function force2Digits(num) {
                    if (num < 10) return `0${num}`;
                    return num;
                }
                timerDisplay.ms = e.detail - timerDisplay.startMs;

                const cs = Math.floor(timerDisplay.ms / 10) % 100;
                const sec = Math.floor(timerDisplay.ms / 1000) % 60;
                const min = Math.floor(timerDisplay.ms / 60000);

                if (min < 1) {
                    timerDisplay.text = `${sec}.${force2Digits(cs)}`;
                }
                else {
                    timerDisplay.text = `${min}:${force2Digits(sec)}.${force2Digits(cs)}`;
                }
            });
            this.addNode(timerDisplay);
        }
    }
}

export { Level };
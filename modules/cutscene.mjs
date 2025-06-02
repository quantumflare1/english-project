import Scene from "./scene.mjs";
import Camera from "./node/camera.mjs";
import Entity from "./node/entity.mjs";
import Rect from "./node/rect.mjs";
import Dialogue from "./node/dialogue.mjs";
import Vector from "./misc/vector.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";
import Assets from "./assets.mjs";
import Sprite from "./node/sprite.mjs";
import { Level } from "./level.mjs";
import Room from "./node/room.mjs";
import * as specialData from "./scripts/special_data.mjs";

import tiles from "../data/img/tile/tile.json" with { type: "json" };
import { CameraSnapEvent, SceneChangeEvent } from "./event.mjs";
import Transition from "./node/transition.mjs";

export default class Cutscene extends Scene {
    data; actors; events;
    curEvent; ticks; dialogue;
    done; waiting;
    loadState;
    prevScene;

    constructor(level, cutscene, prevScene = null) {
        super("cutscene", new Camera(0, 0, 1));
        this.actors = {};
        this.events = new FlatQueue();
        this.done = false;
        this.loadState = 0;
        this.prevScene = prevScene;

        this.initLevel(level);
        this.initCutscene(cutscene);
    }
    async initLevel(path) {
        const json = await (await fetch(path)).json();
    
        const rooms = [];
        // preprocess room data
        for (const i of json.rooms) {
            for (let r = 0; r < i.height; r++) {
                for (let c = 0; c < i.width; c++) {
                    const globalPos = new Vector(c + i.x, r + i.y);
                    globalPos.multiply(40);
    
                    if (i.blocks[r][c] !== 0) {
                        const thisBlock = tiles.block[i.blocks[r][c]-1];
                        const thisBlockSprite = Assets.sprites[thisBlock.name];
                        let textureId = 0;

                        const nwBlock = (c - 1 >= 0 && r - 1 >= 0) ?            i.blocks[r-1][c-1]-1 : 0;
                        const nBlock = (r - 1 >= 0) ?                           i.blocks[r-1][c]-1 : 0;
                        const neBlock = (c + 1 < i.width && r - 1 >= 0) ?       i.blocks[r-1][c+1]-1 : 0;
                        const eBlock = (c + 1 < i.width) ?                      i.blocks[r][c+1]-1 : 0;
                        const seBlock = (c + 1 < i.width && r + 1 < i.height) ? i.blocks[r+1][c+1]-1 : 0;
                        const sBlock = (r + 1 < i.height) ?                     i.blocks[r+1][c]-1 : 0;
                        const swBlock = (c - 1 >= 0 && r + 1 < i.height) ?      i.blocks[r+1][c-1]-1 : 0;
                        const wBlock = (c - 1 >= 0) ?                           i.blocks[r][c-1]-1 : 0;
    
                        const nw = (c - 1 >= 0 && r - 1 >= 0) ?             nwBlock > -1 && (tiles.block[nwBlock].connective || i.blocks[r][c]-1 === nwBlock) : true;
                        const n =  (r - 1 >= 0) ?                           nBlock > -1 && (tiles.block[nBlock].connective || i.blocks[r][c]-1 === nBlock) : true;
                        const ne = (c + 1 < i.width && r - 1 >= 0) ?        neBlock > -1 && (tiles.block[neBlock].connective || i.blocks[r][c]-1 === neBlock) : true;
                        const e =  (c + 1 < i.width) ?                      eBlock > -1 && (tiles.block[eBlock].connective || i.blocks[r][c]-1 === eBlock) : true;
                        const se = (c + 1 < i.width && r + 1 < i.height) ?  seBlock > -1 && (tiles.block[seBlock].connective || i.blocks[r][c]-1 === seBlock) : true;
                        const s =  (r + 1 < i.height) ?                     sBlock > -1 && (tiles.block[sBlock].connective || i.blocks[r][c]-1 === sBlock) : true;
                        const sw = (c - 1 >= 0 && r + 1 < i.height) ?       swBlock > -1 && (tiles.block[swBlock].connective || i.blocks[r][c]-1 === swBlock) : true;
                        const w =  (c - 1 >= 0) ?                           wBlock > -1 && (tiles.block[wBlock].connective || i.blocks[r][c]-1 === wBlock) : true;

                        const texVariant = thisBlockSprite.name;
    
                        // very readable autotiling code
                        if (!n && !e && !s && !w) textureId = texVariant.outer_all;
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
                        else textureId = texVariant.inner;
    
                        const pixelPos = new Vector(globalPos.x + thisBlock.offX, globalPos.y + thisBlock.offY);
                        const texDetails = thisBlockSprite.sprite[textureId];
    
                        // incomprehensible
                        this.addNode(new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisBlock.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1));
                    }
    
                    if (i.decals[r][c] !== 0) {
                        const thisDecal = tiles.decal[i.decals[r][c]-1];
                        const thisDecalSprite = Assets.sprites[thisDecal.name];
                        const textureId = thisDecalSprite.name.default; // placeholder!!
                        const texDetails = thisDecalSprite.sprite[textureId];
                        const pixelPos = new Vector(globalPos.x + thisDecal.offX, globalPos.y + thisDecal.offY);
                        
                        this.addNode(new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisDecal.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1));
                    }

                    if (i.specials[r][c] !== 0) {
                        const thisSpecial = tiles.special[i.specials[r][c]-1];
                        const pixelPos = new Vector(globalPos.x + thisSpecial.offX, globalPos.y + thisSpecial.offY);
                        
                        const thisSpecialData = specialData[thisSpecial.type];
                        const thisSpecialSprite = Assets.sprites[thisSpecial.name];
                        const textureId = thisSpecialSprite.name.default; // placeholder!!
                        const texDetails = thisSpecialSprite.sprite[textureId];

                        const special = thisSpecialData?.animated ? new AnimatedSprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisSpecial.z, convertToAnimSpriteList(thisSpecialSprite.sprite), 0, 5) : new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisSpecial.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1);

                        this.addNode(special);
                    }
                }
            }
    
            const thisRoom = new Room(i.x, i.y, i.width, i.height, i.id);
    
            for (const j of rooms) {
                if (j.pos.x + j.dimensions.x === i.x && (i.y <= j.pos.y && i.y + i.height > j.pos.y || j.pos.y <= i.y && j.pos.y + j.dimensions.y > i.y))
                    thisRoom.connect(j, "left");
                if (j.pos.x === i.x + i.width && (i.y <= j.pos.y && i.y + i.height > j.pos.y || j.pos.y <= i.y && j.pos.y + j.dimensions.y > i.y))
                    thisRoom.connect(j, "right");
                if (j.pos.y + j.dimensions.y === i.y && (i.x <= j.pos.x && i.x + i.width > j.pos.x || j.pos.x <= i.x && j.pos.x + j.dimensions.x > i.x))
                    thisRoom.connect(j, "up");
                if (j.pos.y === i.y + i.height && (i.x <= j.pos.x && i.x + i.width > j.pos.x || j.pos.x <= i.x && j.pos.x + j.dimensions.x > i.x))
                    thisRoom.connect(j, "down");
            }
    
            rooms.push(thisRoom);
        }
        this.addRooms(...rooms);
        this.loadState++;
    }
    async initCutscene(path) {
        this.data = await (await fetch(path)).json();
        
        console.log(this.data)
        Object.keys(this.data.actors).forEach((v) => {
            const actor = this.data.actors[v];
            const sprite = Assets.sprites[actor.sprite].sprite[0];

            const entity = new Sprite(
                actor.x + sprite[4], actor.y + sprite[5], 0,
                new Rect(sprite[0], sprite[1], sprite[2], sprite[3]), actor.z
            );
            this.actors[v] = entity;
            this.addNode(entity);
        });

        for (const i of this.data.choreo) {
            this.events.push(i, i.order);
        }
        for (const i of this.data.script) {
            this.events.push(i, i.order);
        }
        dispatchEvent(new CameraSnapEvent(this.data.initialX, this.data.initialY));
        this.curRoom = this.data.initialRoom;
        this.loadState++;
        this.nextEvent();
    }
    update() {
        super.update();

        if (this.done || this.loadState < 2) return;

        if (this.dialogue) {
            if (!this.dialogue.active) {
                this.dialogue = null;
                this.nextEvent();
            }
        }
        else {
            this.ticks++;

            if (this.ticks >= this.curEvent.delay && this.waiting) {
                this.ticks = 0;
                this.waiting = false;
                
                if (this.curEvent.source) {
                    this.dialogue = new Dialogue(this.curEvent.source);
                    this.dialogue.activate();
                    this.addNode(this.dialogue);
                }
            }
            else if (!this.waiting) {
                if (this.ticks >= this.curEvent.time) {
                    this.nextEvent();
                }
                else {
                    const dx = this.curEvent.moveX / this.curEvent.time; // epic division by zero
                    const dy = this.curEvent.moveY / this.curEvent.time;
                    this.actors[this.curEvent.target].move(new Vector(dx, dy));
                }
            }
        }
    }
    nextEvent() {
        this.curEvent = this.events.pop();
        this.ticks = 0;
        this.waiting = true;

        if (!this.curEvent) {
            this.done = true;
            this.ticks = 0;

            if (this.prevScene) {
                this.addNode(new Transition("fadeout", this.prevScene, this));
                this.prevScene.progress++;
            }
            else {
                this.addNode(new Transition("fadeout", new Level(this.data.afterScene), this));
            }
        }
    }
}
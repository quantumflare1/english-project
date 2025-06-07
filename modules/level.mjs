import Room from "./node/room.mjs";
import Scene from "./scene.mjs";
import Camera from "./node/camera.mjs";
import Entity from "./node/entity.mjs";
import Sprite from "./node/sprite.mjs";
import Rect from "./node/rect.mjs";
import Assets from "./assets.mjs";
import Vector from "./misc/vector.mjs";
import Player from "./node/player.mjs";
import Text from "./node/text.mjs";
import Trigger from "./node/trigger.mjs";
import Special from "./node/special.mjs";
import Platform from "./node/platform.mjs";
import * as Scripts from "./scripts/scripts.mjs"

import tiles from "../data/img/tile/tile.json" with { type: "json" };
import { options } from "./options.mjs";
import * as triggerData from "./scripts/trigger_data.mjs";
import * as specialData from "./scripts/special_data.mjs";
import AnimatedSprite from "./node/animated_sprite.mjs";
import { convertToAnimSpriteList } from "./misc/util.mjs";
import { FPSUpdateEvent, SceneChangeEvent, TimeUpdateEvent } from "./event.mjs";
import { input, keybinds } from "./inputs.mjs";
import { createPauseMenu } from "./node/menu/pause_menu.mjs";
import Transition from "./node/transition.mjs";


class Level extends Scene {
    episode;
    dayProg = [
        [2, 4],
        [2, 3, 3]
    ];
    blockList = [];
    triggerList = [];
    specialList = [];
    quest = null;
    progress = 0;
    day = 0;
    sprites = []; // im hardcoding this idc anymore

    roomBlocks = [];

    constructor(path, episode = 0) {
        super("placeholder", new Camera(0, 0, 1));
        this.episode = episode;
        this.init(path);
    }
    async init(path) {
        console.log(path)
        const json = await (await fetch(path)).json();
    
        const rooms = [];
        // preprocess room data
        for (const i of json.rooms) {
            this.roomBlocks.push(i.blocks);
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
                        const blockRect = new Platform(pixelPos.x, pixelPos.y, thisBlock.w, thisBlock.h, thisBlock.blockDir);
                        this.addNode(new Entity(pixelPos.x, pixelPos.y, blockRect, new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisBlock.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1)));
                        this.blockList.push(blockRect);
                    }
    
                    if (i.decals[r][c] !== 0) {
                        const thisDecal = tiles.decal[i.decals[r][c]-1];
                        const thisDecalSprite = Assets.sprites[thisDecal.name];
                        const textureId = thisDecalSprite.name.default; // placeholder!!
                        const texDetails = thisDecalSprite.sprite[textureId];
                        const pixelPos = new Vector(globalPos.x + thisDecal.offX, globalPos.y + thisDecal.offY);
                        
                        this.addNode(new Entity(pixelPos.x, pixelPos.y, new Rect(), new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisDecal.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1)));
                    }

                    if (i.triggers[r][c] !== 0) {
                        const thisTrigger = tiles.trigger[i.triggers[r][c]-1];
                        const pixelPos = new Vector(globalPos.x + thisTrigger.offX, globalPos.y + thisTrigger.offY);
                        
                        const triggerRect = new Trigger(pixelPos.x, pixelPos.y, thisTrigger.w, thisTrigger.h, this, thisTrigger.maxActivations, triggerData[thisTrigger.name]?.ontouch?.func, triggerData[thisTrigger.name]?.ontouch?.params, triggerData[thisTrigger.name]?.oninteract?.func, triggerData[thisTrigger.name]?.oninteract?.params);

                        this.addNode(triggerRect);
                        this.triggerList.push(triggerRect);
                    }

                    if (i.specials[r][c] !== 0) {
                        const thisSpecial = tiles.special[i.specials[r][c]-1];
                        const pixelPos = new Vector(globalPos.x + thisSpecial.offX, globalPos.y + thisSpecial.offY);
                        
                        const thisSpecialData = specialData[thisSpecial.type];
                        const thisSpecialSprite = Assets.sprites[thisSpecial.name];
                        const textureId = thisSpecialSprite.name.default; // placeholder!!
                        const texDetails = thisSpecialSprite.sprite[textureId];

                        // convertToAnimSpriteList(thisSpecialSprite.sprite)
                        const special = new Special(pixelPos.x, pixelPos.y, new Rect(
                            pixelPos.x, pixelPos.y, thisSpecial.w, thisSpecial.h), thisSpecialData?.animated ? new AnimatedSprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisSpecial.z, convertToAnimSpriteList(thisSpecialSprite.sprite), 0, 5) : new Sprite(
                            pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisSpecial.z,
                            new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                        1), this,
                        thisSpecialData?.ontouch?.func, thisSpecialData?.ontouch?.params, thisSpecialData?.whileActive?.func, thisSpecialData?.whileActive?.params)

                        this.addNode(special);
                        
                        this.specialList.push(special);
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
        this.addNode(new Player(json.meta.spawnX, json.meta.spawnY, this, json.meta.playerState));

        if (options.showFps) {
            const fpsDisplay = new Text(5, 14, 100, "60 FPS", "start", "12px font-Pixellari", "white", "follow");

            addEventListener(FPSUpdateEvent.code, (e) => {
                fpsDisplay.text = e.detail + " FPS";
            });
            this.addNode(fpsDisplay);
        }
        if (options.showTimer) {
            const timerDisplay = new Text(315, 14, 100, "0.00", "end", "12px font-Pixellari", "white", "follow");
            timerDisplay.ms = 0; // secret hardcoded hack
            timerDisplay.startMs = document.timeline.currentTime;

            addEventListener(TimeUpdateEvent.code, (e) => {
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

        // im going insane idc anymore
        if (path.includes("episode1")) {
            const laertes = Assets.sprites.laertes.sprite[0];
            const polonius = Assets.sprites.polonius.sprite[0];
            this.sprites.push(new Sprite(-320, -600, -1, new Rect(laertes[0], laertes[1], laertes[2], laertes[3]), 0));
            this.sprites.push(new Sprite(-280, -600, -1, new Rect(polonius[0], polonius[1], polonius[2], polonius[3]), 0));

            this.addNode(this.sprites[0]);
            this.addNode(this.sprites[1]);
            this.totalQs = 2;
        }
        else if (path.includes("episode2")) {
            Scripts.giveQuest(this, null, "Return Hamlet's letters", 0, 0);
            this.totalQs = 2;
        }

        this.addNode(new Transition("fadein", this, this));
    }
    update() {
        super.update();
        if (input.impulse.has(keybinds.pause)) {
            input.consumeInput(keybinds.pause);
            dispatchEvent(new SceneChangeEvent(createPauseMenu(this)));
        }
    }
}

export { Level };
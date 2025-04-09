import Room from "./node/room.mjs";
import Scene from "./scene.mjs";
import Camera from "./node/camera.mjs";
import Entity from "./node/entity.mjs";
import Sprite from "./node/sprite.mjs";
import Rect from "./node/rect.mjs";
import Assets from "./assets.mjs";
import Vector from "./misc/vector.mjs";
import tiles from "../data/tile/tile.json" with { type: "json" };

async function createLevel(path) {
    const scene = new Scene("idk", new Camera());
    const json = await (await fetch(path)).json();

    const rooms = [];
    // preprocess room data
    for (const i of json.rooms) {
        for (let r = 0; r < i.height; r++) {
            for (let c = 0; c < i.width; c++) {
                const globalPos = new Vector(c + i.x, r + i.y);
                globalPos.multiply(10);
                if (i.tiles[r][c] !== 0) {
                    const thisBlock = tiles.block[i.tiles[r][c]-1];
                    const thisBlockSprite = Assets.sprites[thisBlock.name];
                    let textureId = 0;

                    const nw = (c - 1 >= 0 && r - 1 >= 0) ?             i.tiles[r-1][c-1] > 0 : true;
                    const n =  (r - 1 >= 0) ?                           i.tiles[r-1][c] > 0 : true;
                    const ne = (c + 1 < i.width && r - 1 >= 0) ?        i.tiles[r-1][c+1] > 0 : true;
                    const w =  (c - 1 >= 0) ?                           i.tiles[r][c-1] > 0 : true;
                    const e =  (c + 1 < i.width) ?                      i.tiles[r][c+1] > 0 : true;
                    const sw = (c - 1 >= 0 && r + 1 < i.height) ?       i.tiles[r+1][c-1] > 0 : true;
                    const s =  (r + 1 < i.height) ?                     i.tiles[r+1][c] > 0 : true;
                    const se = (c + 1 < i.width && r + 1 < i.height) ?  i.tiles[r+1][c+1] > 0 : true;

                    const texVariant = thisBlockSprite.name;

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

                    const pixelPos = new Vector(globalPos.x + thisBlock.offX, globalPos.y + thisBlock.offY);
                    const texDetails = thisBlockSprite.sprite[textureId];

                    // incomprehensible
                    scene.addNode(new Entity(pixelPos.x, pixelPos.y, new Rect(
                        pixelPos.x, pixelPos.y, thisBlock.width, thisBlock.height
                    ), new Sprite(
                        pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisBlock.z,
                        new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                    1)));
                }

                if (i.hazards[r][c] !== 0) {
                    const thisHazard = tiles.hazard[i.hazards[r][c]-1];
                    const thisHazardSprite = Assets.sprites[thisHazard.name];
                    const textureId = thisHazardSprite.name[`facing_${thisHazard.facing}`];
                    const texDetails = thisHazardSprite.sprite[textureId];
                    const pixelPos = new Vector(globalPos.x + thisHazard.offX, globalPos.y + thisHazard.offY);
                    //console.log(texDetails)
                    
                    scene.addNode(new Entity(pixelPos.x, pixelPos.y, new Rect(
                        pixelPos.x, pixelPos.y, thisHazard.width, thisHazard.height
                    ), new Sprite(
                        pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisHazard.z,
                        new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                    1)));
                }

                if (i.decals[r][c] !== 0) {
                    const thisDecal = tiles.decal[i.decals[r][c]-1];
                    const thisDecalSprite = Assets.sprites[thisDecal.name];
                    const textureId = thisDecalSprite.name.default; // placeholder!!
                    const texDetails = thisDecalSprite.sprite[textureId];
                    const pixelPos = new Vector(globalPos.x + thisDecal.offX, globalPos.y + thisDecal.offY);
                    
                    scene.addNode(new Entity(pixelPos.x, pixelPos.y, new Rect(
                        pixelPos.x, pixelPos.y, thisDecal.width, thisDecal.height
                    ), new Sprite(
                        pixelPos.x + texDetails[4], pixelPos.y + texDetails[5], thisDecal.z,
                        new Rect(texDetails[0], texDetails[1], texDetails[2], texDetails[3]),
                    1)));
                }

                /*if (i.specials[r][c] !== 0) {
                    const thisSpecial = decalTypes[i.specials[r][c]];
                    curRoomSpecials.push(new Tile.Special(c * 10 + thisSpecial.offX, r * 10 + thisSpecial.offY, thisSpecial.w, thisSpecial.h, false, i.specials[r][c], thisSpecial.z));
                }

                if (i.triggers[r][c] !== 0) {
                    const thisTrigger = decalTypes[i.triggers[r][c]];
                    curRoomTriggers.push(new Tile.Trigger(c * 10 + thisTrigger.offX, r * 10 + thisTrigger.offY, thisTrigger.w, thisTrigger.h, () => {}));
                }*/
            }
        }

        const thisRoom = new Room(i.x, i.y, i.width, i.height);

        for (const j of rooms) {
            if (j.x + j.width === i.x)
                thisRoom.connect(j, "left");
            if (j.x === i.x + i.width)
                thisRoom.connect(j, "right");
            if (j.y + j.height === i.y)
                thisRoom.connect(j, "up");
            if (j.y === i.y + i.height)
                thisRoom.connect(j, "down");
        }

        rooms.push(thisRoom);
    }
    scene.addRooms(...rooms);

    return scene;
}
/*class Level {
    rooms = [];
    curRoom = 0;
    scene; bg;

    /**
     * Creates a new level
     * @param {string} path A path to the level JSON 
     *//*
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
}*/

export { createLevel };
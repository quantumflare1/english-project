import Renderer from "./modules/renderer.mjs";
import Editor from "./modules/editor/room_editor.mjs";
import MenuItem from "./modules/editor/menu_item.mjs";
import Assets from "./modules/assets.mjs";
import Mouse from "./modules/editor/mouse.mjs";

import tiles from "./data/img/tile/tile.json" with { type: "json" };
import { AssetLoadEvent, EditorImportEvent, EditorRoomChangeEvent, EditorTileSelectEvent, FreezeTimeEvent, SceneChangeEvent, SceneLoadEvent } from "./modules/event.mjs";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const MS_PER_TICK = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let renderer, scene, mouse;

let prevTab;

let tps = 0;

/**
 * Runs game logic
 * @param {number} ms Milliseconds since page loaded
 */
function tick(ms) {
    let tickTime = ms - lastTickTime;

    while (tickTime > MS_PER_TICK) {
        performance.mark("tick");
        lastTickTime += MS_PER_TICK;

        if (freezeTicks > 0) freezeTicks--;
        
        else {
            // avoid speedup if you tab out (or lag for more than 3 ticks)
            if (tickTime > 3 * MS_PER_TICK) lastTickTime = ms;

            // if refresh rate < tick rate, hurry it up
            //player.tick();
            scene.update();
        }
        tps++;
        tickTime = ms - lastTickTime;
        
        //console.log(performance.measure("tick"));
    }
    if (ms - lastSecondTime > 1000) {
        lastSecondTime = ms;
        console.log(tps);
        tps = 0;
    }
    performance.mark("render");

    scene.refreshRenderList();
    renderer.draw((ms - lastTickTime) / MS_PER_TICK, scene);
    //console.log(performance.measure("render"));

    requestAnimationFrame(tick);
}

function load() {
    addEventListener(FreezeTimeEvent.code, (e) => {
        freezeTicks = e.detail;
    });

    addEventListener(AssetLoadEvent.code, async () => {
        function loadTiles(tileType) {
            const menu = $(`${tileType}s`);
            let defaultSprite;

            for (const i of tiles[tileType]) { // ts so inefficient :wilted_rose:
                switch (tileType) {
                    case "block":
                        defaultSprite = "outer_all";
                        break;
                    case "hazard":
                        defaultSprite = `facing_${i.facing}`;
                        break;
                    default:
                        defaultSprite = "default";
                }
                const thisTile = Assets.sprites[i.name];
                console.log(thisTile.name)
                const spr = thisTile.sprite[thisTile.name[defaultSprite]];
                const osc = new OffscreenCanvas(spr[2], spr[3]); // ??
                const osctx = osc.getContext("2d");
                osctx.putImageData(Assets.spriteCtx.getImageData(spr[0], spr[1], spr[2], spr[3]), 0, 0);

                const name = (tileType === "hazard") ? `${i.name}_${i.facing}` : i.name;

                const img = new Image(spr[2], spr[3]);
                osc.convertToBlob().then((res) => {
                    img.src = URL.createObjectURL(res);
                    menu.appendChild(new MenuItem(img, tileType, name).div);
                });
            }
        }
        loadTiles("block");
        loadTiles("hazard");
        loadTiles("decal");
        loadTiles("special");

        addEventListener(SceneLoadEvent.code, () => {
            requestAnimationFrame(tick);
        });

        renderer = new Renderer($("wrapper"), "#4f3969", "#331f52");
        mouse = new Mouse(renderer.canvas);
        scene = new Editor(mouse, renderer.canvas);
        updateRoomInfo();

        //scene = createMainMenu();
    });
    addEventListener(SceneChangeEvent.code, (e) => {
        scene = e.detail;
    });
    Assets.load();

    $("blockTab").addEventListener("click", () => { hideTabs($("blocks")); scene.state = "room"; });
    $("hazardTab").addEventListener("click", () => { hideTabs($("hazards")); scene.state = "room"; });
    $("decalTab").addEventListener("click", () => { hideTabs($("decals")); scene.state = "room"; });
    $("specialTab").addEventListener("click", () => { hideTabs($("specials")); scene.state = "room"; });
    $("triggerTab").addEventListener("click", () => { hideTabs($("triggers")); scene.state = "room"; });
    $("roomTab").addEventListener("click", () => { hideTabs($("room")); updateRoomInfo(); scene.state = "level"; });
    addEventListener(EditorTileSelectEvent.code, (e) => {
        for (const i of $("editMenu").children) {
            for (const j of i.children) {
                if (j.id === `${e.detail.type}_${e.detail.name}`) j.classList.add("selected");
                else j.classList.remove("selected");
            }
        }
    })
    $("name").addEventListener("change", metaUpdate("name"));
    $("spawnRoom").addEventListener("change", metaUpdate("spawnRoom", parseInt));
    $("spawnX").addEventListener("change", metaUpdate("spawnX", parseInt));
    $("spawnY").addEventListener("change", metaUpdate("spawnY", parseInt));
    $("spawnState").addEventListener("change", metaUpdate("playerState", balls));

    $("roomX").addEventListener("change", roomUpdate("x", parseInt));
    $("roomY").addEventListener("change", roomUpdate("y", parseInt));
    $("roomWidth").addEventListener("change", roomUpdate("width", parseInt));
    $("roomHeight").addEventListener("change", roomUpdate("height", parseInt));

    $("newRoom").addEventListener("click", () => {
        scene.createRoom();
    });
    $("export").addEventListener("click", exportFile);
    $("import").addEventListener("click", importFile);
    addEventListener(EditorImportEvent.code, (e) => {
        $("name").value = e.detail.name;
        $("spawnRoom").value = e.detail.spawnRoom;
        $("spawnX").value = e.detail.spawnX;
        $("spawnY").value = e.detail.spawnY;
        $("spawnState").value = e.detail.playerState;
    });

    addEventListener(EditorRoomChangeEvent.code, () => {
        updateRoomInfo();
    });
}

function hideTabs(tab) {
    const tabs = $("editMenu").children;
    for (const i of tabs) {
        if (i.classList.contains("visible") && i.id !== "room") prevTab = i;
        i.classList.add("hide");
        i.classList.remove("visible");
    }
    tab.classList.remove("hide");
    tab.classList.add("visible");
}

function updateRoomInfo() {
    $("roomX").value = scene.room?.x;
    $("roomY").value = scene.room?.y;
    $("roomWidth").value = scene.room?.width;
    $("roomHeight").value = scene.room?.height;
    $("roomId").textContent = `Room ID ${scene.room?.id}`;
}

function metaUpdate(meta, parser = (v) => { return v; }) {
    return function() {
        scene.editMeta(meta, parser(this.value));
    };
}

function roomUpdate(detail, parser = (v) => { return v; }) {
    return function() {
        scene.editRoom(detail, parser(this.value));
    }
}

// half taken from thirtydollar.website half from stackoverflow
function safeFilename(str) { return str.replace(/[/\\:*?"<>|]/g, ""); }

function importFile() {
    if ("showOpenFilePicker" in window) {
        showOpenFilePicker({
            excludeAcceptAllOption: true, id: 1, types: [{
                description: "Angalta Level format",
                accept: { "application/json": [".json", ".angle"] }
            }]
        }).then((res) => {
            res[0].getFile().then((res) => {
                res.text().then((res) => {
                    scene.importLevel(JSON.parse(res));
                });
            });
        });
    }
    else {
        $("importWarning").classList.remove("hide");
    }
}

function exportFile() {
    const data = scene.level;
    if ("showSaveFilePicker" in window) {
        showSaveFilePicker({
            excludeAcceptAllOption: true, id: 1, types: [{
                description: "Angalta Level format",
                accept: { "application/json": [".json", ".angle"] }
            }],
            suggestedName: scene.level.meta.name + ".angle"
        }).then(async (res) => {
            const writeStream = await res.createWritable();
            await writeStream.write(JSON.stringify(data));
            await writeStream.close();
        });
    }
    else {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        let downloader = document.createElement('a');
        downloader.href = dataStr;
        downloader.dataset.downloadurl = ['text/json', downloader.download, downloader.href].join(':');
        downloader.style.display = "none"; downloader.download = safeFilename(data.meta.name) + ".json";
        downloader.target = "_blank"; document.body.appendChild(downloader);
        downloader.click(); document.body.removeChild(downloader);
    }
}

function balls(v) { // i am so tired right now i can't be assed to name this function properly
    return parseInt(v) + scene.level.rooms[scene.meta.spawnRoom] * 10;
}

addEventListener("contextmenu", (e) => { e.preventDefault() });
addEventListener("load", load);
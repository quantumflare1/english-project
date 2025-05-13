import Renderer from "./modules/renderer.mjs";
import Editor from "./modules/editor/room_editor.mjs";
import MenuItem from "./modules/editor/menu_item.mjs";
import Assets from "./modules/assets.mjs";
import Mouse from "./modules/editor/mouse.mjs";

import tiles from "./data/img/tile/tile.json" with { type: "json" };

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
    addEventListener("game_freezetime", (e) => {
        freezeTicks = e.detail;
    });

    addEventListener("game_assetloaded", async () => {
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
                const spr = thisTile.sprite[thisTile.name[defaultSprite]]; // errorrss
                const osc = new OffscreenCanvas(spr[2], spr[3]);
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

        addEventListener("game_sceneloaded", () => {
            requestAnimationFrame(tick);
        });

        renderer = new Renderer($("wrapper"), "#4f3969", "#331f52");
        mouse = new Mouse(renderer.canvas);
        scene = new Editor(mouse, renderer.canvas);
        updateRoomInfo();

        //scene = createMainMenu();
    });
    addEventListener("game_scenechange", (e) => {
        scene = e.detail;
    });
    Assets.load();

    $("blockTab").addEventListener("click", () => { hideTabs($("blocks")); scene.state = "room"; });
    $("hazardTab").addEventListener("click", () => { hideTabs($("hazards")); scene.state = "room"; });
    $("decalTab").addEventListener("click", () => { hideTabs($("decals")); scene.state = "room"; });
    $("specialTab").addEventListener("click", () => { hideTabs($("specials")); scene.state = "room"; });
    $("triggerTab").addEventListener("click", () => { hideTabs($("triggers")); scene.state = "room"; });
    $("roomTab").addEventListener("click", () => { hideTabs($("room")); updateRoomInfo(); scene.state = "level"; });
    $("name").addEventListener("change", metaUpdate("name"));
    $("spawnRoom").addEventListener("change", metaUpdate("spawnRoom", parseInt));

    $("roomX").addEventListener("change", roomUpdate("x", parseInt));
    $("roomY").addEventListener("change", roomUpdate("y", parseInt));
    $("roomWidth").addEventListener("change", roomUpdate("width", parseInt));
    $("roomHeight").addEventListener("change", roomUpdate("height", parseInt));

    $("newRoom").addEventListener("click", () => {
        scene.createRoom();
    });
    $("export").addEventListener("click", () => { download(scene.level); });

    addEventListener("editor_changeroom", () => {
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
function download(data) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    let downloader = document.createElement('a');
    downloader.href = dataStr;
    downloader.dataset.downloadurl = ['text/json', downloader.download, downloader.href].join(':');
    downloader.style.display = "none"; downloader.download = data.meta.name + ".json";
    downloader.target = "_blank"; document.body.appendChild(downloader);
    downloader.click(); document.body.removeChild(downloader);
}

addEventListener("contextmenu", (e) => { e.preventDefault() });
addEventListener("load", load);
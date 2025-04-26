import Renderer from "./modules/renderer.mjs";
import Editor from "./modules/editor/editor.mjs";
import MenuItem from "./modules/editor/menu_item.mjs";
import Assets from "./modules/assets.mjs";
import tiles from "./data/img/tile/tile.json" with { type: "json" };

const $ = (l) => document.getElementById(l);
const TPS = 60;
const MS_PER_TICK = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let renderer, scene, editor;

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
            // blocks
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
                const spr = thisTile.sprite[thisTile.name[defaultSprite]];
                const osc = new OffscreenCanvas(spr[2], spr[3]);
                const osctx = osc.getContext("2d");
                osctx.putImageData(Assets.spriteCtx.getImageData(spr[0], spr[1], spr[2], spr[3]), 0, 0);

                const img = new Image(spr[2], spr[3]);
                osc.convertToBlob().then((res) => {
                    img.src = URL.createObjectURL(res);
                    menu.appendChild(new MenuItem(img, i.name).div);
                });
            }
        }
        loadTiles("block");
        loadTiles("hazard");
        loadTiles("decal");

        addEventListener("game_sceneloaded", () => {
            requestAnimationFrame(tick);
        });

        renderer = new Renderer($("wrapper"), $("metaMenu"));
        editor = new Editor(renderer.canvas, renderer.ctx);
        //scene = createMainMenu();
    });
    addEventListener("game_scenechange", (e) => {
        scene = e.detail;
    });
    Assets.load();
}

addEventListener("load", load);
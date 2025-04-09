import Renderer from "./modules/renderer.mjs";
import { createLevel } from "./modules/level.mjs";
import * as Audio from "./modules/audio.mjs";
import Assets from "./modules/assets.mjs";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const MS_PER_TICK = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let renderer, scene;

let tps = 0;

const debugCanvas = document.createElement("canvas");
const debugCtx = debugCanvas.getContext("2d");
debugCanvas.width = 752;
debugCanvas.height = 180;
document.body.appendChild(debugCanvas);

function debugDraw() {
    debugCtx.drawImage(Assets.spritesheet, 0, 0);
}

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

    scene.update();
    scene.refreshRenderList();
    renderer.draw((ms - lastTickTime) / MS_PER_TICK, scene);
    //console.log(performance.measure("render"));

    requestAnimationFrame(tick);
}

function load() {
    //Audio.load("./data/assets/bgm/bgm_temple.ogg");

    //addEventListener("click", audioStarter);
    addEventListener("game_freezetime", (e) => {
        freezeTicks = e.detail;
    });
    //  addEventListener("keydown", (e) => {e.preventDefault()});
    //const bg = new Thing.Entity(0, 0, 320, 180, "./data/assets/background/bg_temple.png", -100, new Thing.SpriteConfig(0, 0, 0, 0, 320, 180), 1);

    addEventListener("game_assetloaded", async () => {
        /*camera = new Camera(0, 0, level);
        player = new Player(230, 30, level);*/
        renderer = new Renderer();
        scene = await createLevel("./data/level/level.json");

        requestAnimationFrame(tick);
        debugDraw();
    });
    Assets.load();
}

function audioStarter(e) {
    Audio.play();
    removeEventListener("click", audioStarter);
}

addEventListener("load", load);
import * as Thing from "./modules/thing.mjs";
import Player from "./modules/node/player.mjs";
import Renderer from "./modules/renderer.mjs";
import * as Level from "./modules/level.mjs";
import Camera from "./modules/camera.mjs";
import * as Audio from "./modules/audio.mjs";
import Scene from "./modules/scene.mjs";
import { testScene } from "./modules/scenes.mjs";
import Assets from "./modules/assets.mjs";

// for offline development
//import FlatQueue from "./modules/flat_queue_mirror.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const MS_PER_TICK = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let renderer;

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

    testScene.update();
    testScene.refreshRenderList();
    renderer.draw((ms - lastTickTime) / MS_PER_TICK, testScene);
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

    addEventListener("game_assetloaded", () => {
        /*camera = new Camera(0, 0, level);
        player = new Player(230, 30, level);*/
        renderer = new Renderer();

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
import Player from "./modules/player.mjs";
import Renderer from "./modules/renderer.mjs";
import * as Level from "./modules/level.mjs";
import Camera from "./modules/camera.mjs";
import * as Audio from "./modules/audio.mjs";
import Scene from "./modules/scene.mjs";

// for offline development
import FlatQueue from "./modules/flat_queue_mirror.mjs";
//import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const msPerTick = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let player, camera, renderer;

let sdhjlf = 0; // very well named debug variable (represents tps)

function tick(ms) {
    let tickTime = ms - lastTickTime;

    while (tickTime > msPerTick) {
        performance.mark("tick");
        lastTickTime += msPerTick;

        if (freezeTicks > 0) {
            freezeTicks--;
        }
        else {
            // avoid speedup if you tab out (or lag for more than 3 ticks)
            if (tickTime > 3 * msPerTick) lastTickTime = ms;

            // if refresh rate < tick rate, hurry it up
            player.tick();
        }
        sdhjlf++;
        tickTime = ms - lastTickTime;
        
        //console.log(performance.measure("tick"));
    }
    if (ms - lastSecondTime > 1000) {
        lastSecondTime = ms;
        console.log(sdhjlf);
        sdhjlf = 0;
    }
    performance.mark("render");

    // pack stuff to be rendered together
    const renderedObjects = new FlatQueue();
    renderedObjects.push(player, player.z);
    for (const i of Level.rooms[Level.curRoomId].tiles) {
        renderedObjects.push(i, i.z);
    }
    for (const i of Level.rooms[Level.curRoomId].hazards) {
        renderedObjects.push(i, i.z);
    }
    for (const i of Level.rooms[Level.curRoomId].decals) {
        renderedObjects.push(i, i.z);
    }

    camera.update();
    renderer.draw((ms - lastTickTime) / msPerTick, renderedObjects);
    //console.log(performance.measure("render"));

    requestAnimationFrame(tick);
}

function load() {
    Level.init();
    camera = new Camera(0, 0);
    renderer = new Renderer(camera);
    player = new Player(230, 30);
    Audio.load("./data/assets/bgm/bgm_temple.ogg");

    addEventListener("click", audioStarter);
    addEventListener("game_freezetime", (e) => {
        freezeTicks = e.detail;
    });
    //  addEventListener("keydown", (e) => {e.preventDefault()});

    requestAnimationFrame(tick);
}

function audioStarter(e) {
    Audio.play();
    removeEventListener("click", audioStarter);
}

addEventListener("load", load);
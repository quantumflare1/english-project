import Player from "./modules/player.mjs";
import Renderer from "./modules/renderer.mjs";
import * as Level from "./modules/level.mjs";
import Camera from "./modules/camera.mjs";
import * as Audio from "./modules/audio.mjs";
import Scene from "./modules/scene.mjs";

// for offline development
//import FlatQueue from "./modules/flat_queue_mirror.mjs";
import FlatQueue from "https://cdn.jsdelivr.net/npm/flatqueue/+esm";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const MS_PER_TICK = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let player, camera, renderer, level, bg;
const scenes = {
    menu: new Scene(),
    game: new Scene()
}; // sure just load everything in the game at once why not
let activeScene = "game";

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
            player.tick();
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

    // pack stuff to be rendered together
    const renderedObjects = new FlatQueue();
    for (const i of scenes[activeScene].entities)
        renderedObjects.push(i, i.z);

    scenes[activeScene].camera.update();
    level.bg.tick();
    renderer.draw((ms - lastTickTime) / MS_PER_TICK, renderedObjects);
    //console.log(performance.measure("render"));

    requestAnimationFrame(tick);
}

function load() {
    level = new Level.Level("./data/level/level.json", scenes.game);
    Audio.load("./data/assets/bgm/bgm_temple.ogg");

    addEventListener("click", audioStarter);
    addEventListener("game_freezetime", (e) => {
        freezeTicks = e.detail;
    });
    //  addEventListener("keydown", (e) => {e.preventDefault()});

    addEventListener("game_levelload", () => {
        camera = new Camera(0, 0, level);
        player = new Player(230, 30, level);
        player.addToScene(scenes.game);
        renderer = new Renderer(camera);
        camera.addToScene(scenes.game);

        requestAnimationFrame(tick);
    });
}

function audioStarter(e) {
    Audio.play();
    removeEventListener("click", audioStarter);
}

addEventListener("load", load);
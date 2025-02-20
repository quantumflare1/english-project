import * as Player from "./modules/player.mjs";
import * as Renderer from "./modules/renderer.mjs";
import * as Level from "./modules/level.mjs";
import * as Camera from "./modules/camera.mjs";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const msPerTick = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;
let freezeTicks = 0;

let sdhjlf = 0; // very well named debug variable (represents tps)

function tick(ms) {
    let tickTime = ms - lastTickTime;

    while (tickTime > msPerTick) {
        performance.mark("tick");
        lastTickTime += msPerTick;

        if (freezeTicks > 0) {
            freezeTicks--;
            continue;
        }
        
        // avoid speedup if you tab out (or lag for more than 3 ticks)
        if (tickTime > 3 * msPerTick) lastTickTime = ms;

        // if refresh rate < tick rate, hurry it up
        Player.player.tick();
        Camera.camera.update();
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
    Renderer.renderer.draw((ms - lastTickTime) / msPerTick, Player.player, ...Level.tiles, ...Level.decals);
    //console.log(performance.measure("render"));

    requestAnimationFrame(tick);
}

function load() {
    Level.init();
    Player.init();
    Camera.init();
    Renderer.init();

    addEventListener("game_freezetime", (e) => {
        freezeTicks = e.detail;
    });

    requestAnimationFrame(tick);
}

addEventListener("load", load);
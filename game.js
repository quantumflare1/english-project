import * as Player from "./modules/player.mjs";
import * as Renderer from "./modules/renderer.mjs";
import * as Level from "./modules/level.mjs";

const $ = (l) => document.getElementById(l);
const TPS = 60;
const msPerTick = 1000 / TPS;
let lastTickTime = document.timeline.currentTime;
let lastSecondTime = document.timeline.currentTime;

const renderer = new Renderer.Renderer();

let sdhjlf = 0;

function tick(ms) {
    let tickTime = ms - lastTickTime;

    if (tickTime > msPerTick) {
        performance.mark("tick");
        lastTickTime += msPerTick;
        
        // avoid speedup if you tab out (or lag for more than 3 ticks)
        if (tickTime > 3 * msPerTick) lastTickTime = ms;

        // if refresh rate < tick rate, hurry it up
        while (tickTime > msPerTick) {
            Player.player.tick();
            tickTime -= msPerTick;
        }
        sdhjlf++;
        //console.log(performance.measure("tick"));
    }
    if (ms - lastSecondTime > 1000) {
        lastSecondTime = ms;
        console.log(sdhjlf);
        sdhjlf = 0;
    }
    performance.mark("render");
    renderer.draw((ms - lastTickTime) / msPerTick, Player.player, ...Level.tiles);
    //console.log(performance.measure("render"));

    requestAnimationFrame(tick);
}

function load() {
    Player.init();
    Level.init();

    requestAnimationFrame(tick);
}

addEventListener("load", load);
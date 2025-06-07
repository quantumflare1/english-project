import Player from "../node/player.mjs";
import { PlayerStateChangeEvent, SceneChangeEvent } from "../event.mjs";
import { Level } from "../level.mjs";
import Vector from "../misc/vector.mjs";
import { lerp } from "../misc/util.mjs";
import Dialogue from "../node/dialogue.mjs";
import Quest from "../node/quest.mjs";
import Text from "../node/text.mjs";
import Transition from "../node/transition.mjs";
import Cutscene from "../cutscene.mjs";

function test() {
    console.log("Activated!")
}

function startMove(scene, player, time, moveX, moveY) {
    this.targetTime = time;
    this.targetPos = new Vector(this.pos.x + moveX, this.pos.y + moveY);
    this.startPos = this.pos.copy();
    this.moveTime = 0;
    this.active = true;
}

function move() {
    this.moveTime++;

    const moveX = lerp(this.startPos.x, this.targetPos.x, this.moveTime / this.targetTime) - this.pos.x;
    const moveY = lerp(this.startPos.y, this.targetPos.y, this.moveTime / this.targetTime) - this.pos.y;
    this.move(new Vector(moveX, moveY));
    if (this.pos.equals(this.targetPos))
        this.active = false;
}

function startDialogue(scene, player, path) {
    const d = new Dialogue(path);
    scene.addNode(d);
    d.activate();
}

function setSpawnPoint(scene, player) {
    player.setSpawn(this.pos.x + (this.hitbox.dimensions.x - player.hitbox.dimensions.x) / 2, this.pos.y + (this.hitbox.dimensions.y - player.hitbox.dimensions.x) / 2);
    this.done = true;
}

function giveQuest(scene, player, description, id, day) {
    if (scene.progress === id && scene.day === day && !scene.quest) {
        scene.quest = new Quest(description, id);
        scene.questTitle = new Text(10, 20, 99, "QUEST", "start", "16px font-Pixellari", "#ffff00", "follow");
        scene.addNode(scene.quest);
        scene.addNode(scene.questTitle);
    }
}

function completeQuest(scene, player, id) {
    if (scene.quest?.id === id) {
        scene.removeNode(scene.quest);
        scene.removeNode(scene.questTitle);
        scene.quest = null;
        scene.questTitle = null;
    }
}

function sleep(scene, player, auto = false) {
    console.log(auto)
    if (auto || scene.progress >= scene.dayProg[scene.episode][scene.day]) {
        if (scene.dayProg[scene.episode]?.length - 1 === scene.day && !auto) {
            nextEpisode(scene, player, `./data/level/episode${scene.episode+2}.json`);
        }
        else {
            if (scene.episode === 1 && scene.day === 1 && scene.progress === 3) {
                giveQuest(scene, player, "See your father", 3, 1);
            }
            scene.day++;
            scene.addNode(new Transition("fadeout", scene, scene, 60));
        }
    }
}

function encounter(scene, player, day, prog, level, cutscene, callback, ...args) {
    if (scene.day === day && scene.progress === prog) { // prog for progesterone babyyyyyy
        scene.addNode(new Transition("fadeout", new Cutscene(level, cutscene, scene), scene, 0, callback, ...args));
    }
}

function ending(scene, player) {
    console.log("enbd")
    scene.addNode(new Transition("fadeout", new Cutscene("./data/level/episode3.json", "./data/cutscene/cutscene_ep3_0.json"), scene));
}

function nextEpisode(scene, player, newEpisode) {
    scene.addNode(new Transition("fadeout", new Level(newEpisode, scene.episode+1), scene, 150));
}

export { test, startMove, move, setSpawnPoint, startDialogue, giveQuest, completeQuest, sleep, encounter, ending };
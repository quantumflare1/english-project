import Player from "../node/player.mjs";
import { PlayerStateChangeEvent } from "../event.mjs";
import Vector from "../misc/vector.mjs";
import { lerp } from "../misc/util.mjs";
import Dialogue from "../node/dialogue.mjs";

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

export { test, startMove, move, setSpawnPoint, startDialogue };
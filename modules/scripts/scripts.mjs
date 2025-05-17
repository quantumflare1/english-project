import Player from "../node/player.mjs";
import { PlayerStateChangeEvent } from "../event.mjs";
import Vector from "../misc/vector.mjs";
import { lerp } from "../misc/util.mjs";

function test() {
    console.log("Activated!")
}

function pickUpGrapple() {
    dispatchEvent(new PlayerStateChangeEvent(Player.states.DEFAULT));
}

function startMove(player, time, moveX, moveY) {
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

function setSpawnPoint(player) {
    player.setSpawn(this.pos.x + (this.hitbox.dimensions.x - player.hitbox.dimensions.x) / 2, this.pos.y + (this.hitbox.dimensions.y - player.hitbox.dimensions.x) / 2);
    this.done = true;
}

function givePlayerGrapple(player) {
    player.state = Player.states.DEFAULT;
    this.done = true;
}

export { test, pickUpGrapple, startMove, move, setSpawnPoint, givePlayerGrapple };
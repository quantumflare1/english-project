import Player from "./node/player.mjs";
import { PlayerStateChangeEvent } from "./event.mjs";

function test() {
    console.log("Activated!")
}

function pickUpGrapple() {
    dispatchEvent(new PlayerStateChangeEvent(Player.states.DEFAULT));
}

export { test, pickUpGrapple };
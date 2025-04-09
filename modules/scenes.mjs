import Scene from "./scene.mjs";
import Player from "./node/player.mjs";
import Node from "./node/node.mjs";
import Sprite from "./node/sprite.mjs";
import Entity from "./node/entity.mjs";
import Camera from "./node/camera.mjs";
import Rect from "./node/rect.mjs";
import Room from "./node/room.mjs";

const gameSceneNodes = [
    //new Player(0, 0, null)
];

const gameScene = new Scene("game");

for (const i of gameSceneNodes)
    gameScene.addNode(i);

const camera = new Camera(0, 0, 1);
const testRoom = new Room(0, 0, 32, 18);
const testScene = new Scene("test", camera, testRoom);

const testRect = new Rect(0, 0, 10, 10);
const testRect2 = new Rect(50, 0, 10, 10);
const testSprite = new Sprite(0, 0, 10, testRect);
const testSprite2 = new Sprite(10, 0, 10, testRect2);


testScene.addNode(testSprite);
testScene.addNode(testSprite2);
testScene.refreshRenderList();

export { testScene };
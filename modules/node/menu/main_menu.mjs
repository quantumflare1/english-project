import Room from "../room.mjs";
import MenuElement from "./element.mjs";
import Sprite from "../sprite.mjs";
import Rect from "../rect.mjs";
import Assets from "../../assets.mjs";
import Scene from "../../scene.mjs";
import Camera from "../camera.mjs";
import Cursor from "./cursor.mjs";

import { SceneLoadEvent } from "../../event.mjs";
import * as MenuData from "./main_data.mjs";

let bgSprRect = [];

const elData = MenuData.elements;

function createMainMenu() {
    if (bgSprRect.length === 0)
        throw new Error("background not loaded");

    // note: if text is an odd number of pixels wide then you have to add a 0.5px offset for them to render properly (stupid as hell)
    const mainMenuElements = [];

    for (let i = 0; i < elData.length; i++)
        mainMenuElements.push(new MenuElement(...elData[i].params));
    for (let i = 0; i < elData.length; i++) {
        if ("left" in elData[i].directions) mainMenuElements[i].setLeftElement(mainMenuElements[elData[i].directions.left]);
        if ("right" in elData[i].directions) mainMenuElements[i].setRightElement(mainMenuElements[elData[i].directions.right]);
        if ("up" in elData[i].directions) mainMenuElements[i].setAboveElement(mainMenuElements[elData[i].directions.up]);
        if ("down" in elData[i].directions) mainMenuElements[i].setBelowElement(mainMenuElements[elData[i].directions.down]);
    }

    const mainMenu = {
        menu: new Room(0, 0, 32, 18, 0),
        children: [
            new Sprite(0, 0, -99, new Rect(bgSprRect[0], bgSprRect[1], bgSprRect[2], bgSprRect[3]), 1),
            new Cursor(...mainMenuElements)
        ],
        camera: new Camera(0, 0, 1)
    };
    
    const scene = new Scene("main", mainMenu.camera, mainMenu.menu);
    for (const i of mainMenu.children)
        scene.addNode(i);
    for (const i of mainMenuElements)
        scene.addNode(i);

    dispatchEvent(new SceneLoadEvent()); // todo: figure out putting this right into the scene class
    return scene;
}

addEventListener("game_assetloaded", () => {
    bgSprRect = Assets.sprites.bg_menu.sprite[0];
});

export { createMainMenu };
import Room from "../room.mjs";
import MenuElement from "./element.mjs";
import { unpackMatrix } from "../../misc/util.mjs";
import Scene from "../../scene.mjs";
import Camera from "../camera.mjs";
import Cursor from "./cursor.mjs";

import { SceneLoadEvent } from "../../event.mjs";
import * as MenuData from "./main_data.mjs";


function connectGraph(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        const cur = arr[i];
        if ("left" in cur.directions) target[i].connect(target[cur.directions.left], "left");
        if ("right" in cur.directions) target[i].connect(target[cur.directions.right], "right");
        if ("up" in cur.directions) target[i].connect(target[cur.directions.up], "up");
        if ("down" in cur.directions) target[i].connect(target[cur.directions.down], "down");
    }
}

function createMainMenu() {
    // note: if text is an odd number of pixels wide then you have to add a 0.5px offset for them to render properly (stupid as hell)
    const mainMenuElements = [];
    const mainMenus = [];

    for (let i = 0; i < MenuData.rooms.length; i++) {
        mainMenus.push(new Room(...MenuData.rooms[i].params));
        mainMenuElements.push([]);

        const elData = MenuData.elements[i];
        for (let j = 0; j < elData.length; j++) {
            elData[j].params[0] += mainMenus[i].pos.x * 10;
            elData[j].params[1] += mainMenus[i].pos.y * 10;
            mainMenuElements[i].push(new MenuElement(...elData[j].params));
        }
        connectGraph(elData, mainMenuElements[i]);
    }
    connectGraph(MenuData.rooms, mainMenus);
    
    const scene = new Scene("main", new Camera(0, 0, 1), ...mainMenus);
    for (const i of MenuData.other)
        scene.addNode(i);
    for (const i of mainMenuElements)
        for (const j of i)
            scene.addNode(j);
    
    const cursor = new Cursor(...unpackMatrix(mainMenuElements));
    scene.addNode(cursor);
    console.log(scene.rooms)

    dispatchEvent(new SceneLoadEvent()); // todo: figure out putting this right into the scene class
    return scene;
}

export { createMainMenu };
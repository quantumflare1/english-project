import Room from "../room.mjs";
import MenuElement from "./element.mjs";
import { unpackMatrix } from "../../misc/util.mjs";
import Camera from "../camera.mjs";
import Cursor from "./cursor.mjs";

import { SceneLoadEvent } from "../../event.mjs";
import * as MenuData from "../../scripts/pause_data.mjs";
import PauseScene from "../../pause.mjs";


function connectGraph(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        const cur = arr[i];
        if ("left" in cur.directions) target[i].connect(target[cur.directions.left], "left");
        if ("right" in cur.directions) target[i].connect(target[cur.directions.right], "right");
        if ("up" in cur.directions) target[i].connect(target[cur.directions.up], "up");
        if ("down" in cur.directions) target[i].connect(target[cur.directions.down], "down");
    }
}

function createPauseMenu(prevScene) {
    const menuElements = [];
    const menus = [];

    for (let i = 0; i < MenuData.rooms.length; i++) {
        menus.push(new Room(...MenuData.rooms[i].params));
        menuElements.push([]);

        const elData = MenuData.elements[i];
        for (let j = 0; j < elData.length; j++) {
            elData[j].params[0] += menus[i].pos.x * 10;
            elData[j].params[1] += menus[i].pos.y * 10;
            menuElements[i].push(new MenuElement(...elData[j].params));
        }
        connectGraph(elData, menuElements[i]);
    }
    connectGraph(MenuData.rooms, menus);
    
    const scene = new PauseScene(new Camera(0, 0, 1), prevScene, ...menus);
    for (const i of MenuData.other)
        scene.addNode(i);
    for (const i of menuElements)
        for (const j of i)
            scene.addNode(j);
    
    const cursor = new Cursor(scene, ...unpackMatrix(menuElements));
    scene.addNode(cursor);

    dispatchEvent(new SceneLoadEvent());
    return scene;
}

// todo: put this and createMainMenu into one generic method
export { createPauseMenu };
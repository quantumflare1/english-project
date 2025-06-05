import Text from "../node/text.mjs";

import { SceneChangeEvent, RoomChangeEvent, CameraZoomEvent, CursorMoveEvent } from "../event.mjs";
import { Level } from "../level.mjs";
import Sprite from "../node/sprite.mjs";
import Rect from "../node/rect.mjs";
import { input, keybinds } from "../inputs.mjs";
import { displayKey } from "../misc/util.mjs";
import { options, setOption } from "../options.mjs";
import Cutscene from "../cutscene.mjs";

function setTimer() {
    setOption("showTimer", !options.showTimer);
    if (options.showTimer) this.text = "Hide Timer";
    else this.text = "Show Timer";
}

function setFPS() {
    setOption("showFps", !options.showFps);
    if (options.showFps) this.text = "Hide FPS";
    else this.text = "Show FPS";
}

const rooms = [
    {
        params: [0, 0, 32, 18, 0],
        directions: {}
    }
];

const elements = [
    // MAIN
    [
        {
            params: [300, 104, 10, "Play?", "end", "28px font-NotJamSlab14", "black", "", true,
                () => {
                    //const scene = new Cutscene("./data/level/episode1.json", "./data/cutscene/cutscene_ep1_0.json");
                    const scene = new Level("./data/level/episode1.json");
                    dispatchEvent(new SceneChangeEvent(scene));
                }
            ],
            directions: {}
        }
    ],
    
];

const other = [
    new Sprite(0, 0, -99, new Rect(0, 0, 320, 180), 1), // hardcoded sprite rect :(
    new Text(300, 30, 1, "Ophelia", "end", "32px font-Pixellari")
];

export { rooms, elements, other };
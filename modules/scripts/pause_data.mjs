import Text from "../node/text.mjs";

import { SceneChangeEvent, PlayerKillEvent } from "../event.mjs";
import { Level } from "../level.mjs";
import Sprite from "../node/sprite.mjs";
import Rect from "../node/rect.mjs";
import { input, keybinds } from "../inputs.mjs";
import { displayKey } from "../misc/util.mjs";
import { options, setOption } from "../options.mjs";
import FilledRect from "../node/filled_rect.mjs";
import { createMainMenu } from "../node/menu/main_menu.mjs";

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
    [
        {
            params: [40, 70, 10, "Return To Game", "start", "16px font-NotJamUICondensed16", "white", "", true,
                (parent) => {
                    dispatchEvent(new SceneChangeEvent(parent.prevScene));
                }
            ],
            directions: {
                down: 1,
                up: 2
            }
        },
        {
            params: [40, 95, 10, "Retry", "start", "16px font-NotJamUICondensed16", "white", "", true,
                (parent) => {
                    dispatchEvent(new SceneChangeEvent(parent.prevScene));
                    dispatchEvent(new PlayerKillEvent());
                }
            ],
            directions: {
                down: 2,
                up: 0
            }
        },
        {
            params: [40, 120, 10, "Quit to Title", "start", "16px font-NotJamUICondensed16", "white", "", true,
                () => {
                    const scene = createMainMenu();
                    dispatchEvent(new SceneChangeEvent(scene));
                }
            ],
            directions: {
                up: 1,
                down: 0
            }
        }
    ]
];

const other = [
    new FilledRect(0, 0, 320, 180, -99, "rgba(0, 0, 0, 0.5)", "follow"),
    new Text(160, 40, 10, "Game Paused", "center", "28px font-Pixellari", "white", "")
];

export { rooms, elements, other };
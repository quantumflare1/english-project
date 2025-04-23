import { SceneChangeEvent } from "../../event.mjs";
import { Level } from "../../level.mjs";

const elements = [
    {
        params: [160, 30, 10, "Play", "center", "16px font-Pixellari", "white", "follow", true,
            () => {
                const scene = new Level("./data/level/level.json");
                dispatchEvent(new SceneChangeEvent(scene));
            }
        ],
        directions: {
            "left": 1,
            "right": 2
        }
    },
    {
        params: [80, 30, 10, "Options", "center", "16px font-Pixellari", "white", "follow", true],
        directions: {
            "left": 2,
            "right": 0
        }
    },
    {
        params: [240, 30, 10, "Credits", "center", "16px font-Pixellari", "white", "follow", true],
        directions: {
            "left": 0,
            "right": 1
        }
    }
];



export { elements };
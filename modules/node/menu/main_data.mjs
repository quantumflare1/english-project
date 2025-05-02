import Text from "../text.mjs";

import { SceneChangeEvent, RoomChangeEvent, CameraZoomEvent, CursorMoveEvent } from "../../event.mjs";
import { Level } from "../../level.mjs";
import Sprite from "../sprite.mjs";
import Rect from "../rect.mjs";
import { input, keybinds } from "../../inputs.mjs";
import { displayKey } from "../../misc/util.mjs";

const rooms = [
    {
        params: [0, 0, 32, 18, 0],
        directions: {
            left: 1,
            right: 2
        }
    },
    {
        params: [-32, 0, 32, 18, 1],
        directions: {
            left: 3,
            up: 4,
            down: 5
        }
    },
    {
        params: [32, 0, 32, 18, 2],
        directions: {}
    },
    {
        params: [-64, 0, 32, 18, 3],
        directions: {}
    },
    {
        params: [-32, -18, 32, 18, 4],
        directions: {}
    },
    {
        params: [-32, 18, 32, 26, 5],
        directions: {}
    }
];

const elements = [
    // MAIN
    [
        {
            params: [160.5, 30, 10, "Play", "center", "16px font-NotJamUICondensed16", "black", "follow", true,
                () => {
                    const scene = new Level("./data/level/level.json");
                    dispatchEvent(new SceneChangeEvent(scene));
                }
            ],
            directions: {
                left: 1,
                right: 2
            }
        },
        {
            params: [80, 30, 10, "Options", "center", "16px font-NotJamUICondensed16", "black", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("left"));
                    dispatchEvent(new CursorMoveEvent(6)); // THIS IS NOT GOOD. PLEASE CHANGE THIS
                }
            ],
            directions: {
                left: 2,
                right: 0
            }
        },
        {
            params: [240, 30, 10, "Credits", "center", "16px font-NotJamUICondensed16", "black", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("right"));
                    //dispatchEvent(new CameraZoomEvent(0.8)); // zoom is currently bugged
                    dispatchEvent(new CursorMoveEvent(7));
                }
            ],
            directions: {
                left: 0,
                right: 1
            }
        }
    ],
    // OPTIONS
    [
        {
            params: [128.5, 30, 10, "Other", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("up"));
                    dispatchEvent(new CursorMoveEvent(13));
                }
            ],
            directions: {
                left: 1,
                right: 2
            }
        },
        {
            params: [64.5, 30, 10, "Audio", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("left"));
                    dispatchEvent(new CursorMoveEvent(10));
                }
            ],
            directions: {
                left: 3,
                right: 0
            }
        },
        {
            params: [192.5, 30, 10, "Keybinds", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("down"));
                    dispatchEvent(new CursorMoveEvent(22));
                }
            ],
            directions: {
                left: 0,
                right: 3
            }
        },
        {
            params: [256.5, 30, 10, "Back", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("right"));
                    dispatchEvent(new CursorMoveEvent(1));
                }
            ],
            directions: {
                left: 2,
                right: 1
            }
        }
    ],
    // CREDITS
    [
        {
            params: [20, 30, 10, "Back", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("left"));
                    dispatchEvent(new CursorMoveEvent(2));
                }
            ],
            directions: {}
        }
    ],
    // AUDIO
    [
        {
            params: [80, 30, 10, "Music (soon)", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {

                }
            ],
            directions: {
                right: 1,
                left: 2
            }
        },
        {
            params: [160, 30, 10, "SFX (soon)", "center", "16px font-NotJamUICondensed16", "white", "follow", true],
            directions: {
                left: 0,
                right: 2
            }
        },
        {
            params: [240, 30, 10, "Back", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("right"));
                    dispatchEvent(new CursorMoveEvent(4));
                }
            ],
            directions: {
                left: 1,
                right: 0
            }
        }
    ],
    // OTHER
    [
        {
            params: [80, 30, 10, "Show Timer", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {

                }
            ],
            directions: {
                left: 2,
                right: 1
            }
        },
        {
            params: [160, 30, 10, "Show FPS", "center", "16px font-NotJamUICondensed16", "white", "follow", true],
            directions: {
                right: 2,
                left: 0
            }
        },
        {
            params: [240, 30, 10, "Back", "center", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("down"));
                    dispatchEvent(new CursorMoveEvent(3));
                }
            ],
            directions: {
                right: 0,
                left: 1
            }
        }
    ],
    // KEYBINDS
    [
        {
            params: [40, 30, 10, `Grapple: ${displayKey(keybinds.grapple)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.grapple = key;
                        element.text = `Grapple: ${displayKey(keybinds.grapple)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 1,
                up: 8
            }
        },
        {
            params: [40, 50, 10, `Jump: ${displayKey(keybinds.jump)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.jump = key;
                        element.text = `Jump: ${displayKey(keybinds.jump)}`;
                        element.toggleSelect();
                    }

                }
            ],
            directions: {
                down: 2,
                up: 0
            }
        },
        {
            params: [40, 70, 10, `Left: ${displayKey(keybinds.left)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.left = key;
                        element.text = `Left: ${displayKey(keybinds.left)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 3,
                up: 1
            }
        },
        {
            params: [40, 90, 10, `Right: ${displayKey(keybinds.right)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.right = key;
                        element.text = `Right: ${displayKey(keybinds.right)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 4,
                up: 2
            }
        },
        {
            params: [40, 110, 10, `Up: ${displayKey(keybinds.up)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.up = key;
                        element.text = `Up: ${displayKey(keybinds.up)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 5,
                up: 3
            }
        },
        {
            params: [40, 130, 10, `Down: ${displayKey(keybinds.down)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.down = key;
                        element.text = `Down: ${displayKey(keybinds.down)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 6,
                up: 4
            }
        },
        {
            params: [40, 150, 10, `Select: ${displayKey(keybinds.select)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.select = key;
                        element.text = `Select: ${displayKey(keybinds.select)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 7,
                up: 5
            }
        },
        {
            params: [40, 170, 10,  `Cancel: ${displayKey(keybinds.cancel)}`, "start", "16px font-NotJamUICondensed16", "white", "follow", false,
                (element) => {
                    if (input.impulse.size > 0) {
                        const key = input.impulse.values().next().value;
                        keybinds.cancel = key;
                        element.text = `Cancel: ${displayKey(keybinds.cancel)}`;
                        element.toggleSelect();
                    }
                }
            ],
            directions: {
                down: 8,
                up: 6
            }
        },
        {
            params: [40, 190, 10, "Back", "start", "16px font-NotJamUICondensed16", "white", "follow", true,
                () => {
                    dispatchEvent(new RoomChangeEvent("up"));
                    dispatchEvent(new CursorMoveEvent(5));
                }
            ],
            directions: {
                down: 0,
                up: 7
            }
        }
    ]
];

const other = [
    new Sprite(0, 0, -99, new Rect(0, 0, 320, 180), 1), // hardcoded sprite rect :(
    new Text(480, 30, 10, "Credits", "center", "28px font-Pixellari", "white", "follow"),
    new Text(340, 60, 10, "Programming/Art: QuantumFlare", "start", "16px font-NotJamUICondensed16", "white", "follow"),
    new Text(620, 80, 10, "Library: FlatQueue by Mourner", "end", "16px font-NotJamUICondensed16", "white", "follow"),
    new Text(340, 100, 10, "Font: NotJamUICondensed/NotJamSlab", "start", "16px font-NotJamUICondensed16", "white", "follow"),
    new Text(340, 116, 10, "by NotJamGames", "start", "16px font-NotJamUICondensed16", "white", "follow"),
    new Text(620, 140, 10, "Special Thanks: Love2D, EXOK, RobTop", "end", "16px font-NotJamUICondensed16", "white", "follow"),
    new Text(480.5, 170, 10, "And thank you for playing!", "center", "16px font-NotJamUICondensed16", "white", "follow")
];

export { rooms, elements, other };
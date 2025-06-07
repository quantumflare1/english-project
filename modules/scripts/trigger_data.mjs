import Cutscene from "../cutscene.mjs";
import { SceneChangeEvent } from "../event.mjs";
import Vector from "../misc/vector.mjs";

import * as Scripts from "./scripts.mjs";

const quest1 = {
    ontouch: {
        func: Scripts.giveQuest,
        params: ["Say goodbye to Laertes", 0, 0]
    }
},
doneQuest1 = {
    oninteract: {
        func: (s, p, i) => {
            Scripts.encounter(s, p, 0, 0, "./data/level/episode1.json", "./data/cutscene/cutscene_ep1_1.json", Scripts.completeQuest, s, p, i);
            s.removeNode(s.sprites[0]);
        },
        params: [0]
    }
},
sleep = {
    oninteract: {
        func: Scripts.sleep,
        params: []
    }
},
messenger = {
    ontouch: {
        func: Scripts.encounter,
        params: [0, 1, "./data/level/episode1.json", "./data/cutscene/cutscene_ep1_2.json"]
    }
},
madHamlet = {
    ontouch: {
        func: (s, p, d, prog, l, c) => {
            Scripts.encounter(s, p, d, prog, l, c, Scripts.giveQuest, s, p, "Tell your father", 3, 1);
        },
        params: [1, 2, "./data/level/episode1.json", "./data/cutscene/cutscene_ep1_3.json"]
    }
},
doneQuest2 = {
    oninteract: {
        func: (s, p, i) => {
            Scripts.encounter(s, p, 1, i, "./data/level/episode1.json", "./data/cutscene/cutscene_ep1_4.json", () => { s.removeNode(s.sprites[1]); Scripts.completeQuest(s, p, i) });
        },
        params: [3]
    }
},
inspectRue = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers1.json"]
    }
},
inspectRosemary = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers2.json"]
    }
},
inspectPansy = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers3.json"]
    }
},
inspectFennel = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers4.json"]
    }
},
inspectColumbine = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers5.json"]
    }
},
inspectDaisy = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers6.json"]
    }
},
inspectViolet = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers7.json"]
    }
},
inspectViolet2 = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_flowers8.json"]
    }
},
inspectDrawer = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_drawer.json"]
    }
},
inspectDrawer2 = {
    oninteract: {
        func: (s, p, dialogue1, dialogue2) => {
            if (s.day === 0 && s.progress === 0) {
                Scripts.startDialogue(s, p, dialogue1);
                s.progress++;
            }
            else {
                Scripts.startDialogue(s, p, dialogue2);
            }
        },
        params: ["./data/dialogue/check_drawer2.json", "./data/dialogue/check_drawer3.json"]
    }
},
inspectDrawer3 = {
    oninteract: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/check_drawer3.json"]
    }
},
nunnery = {
    ontouch: {
        func: (s, p, i) => {
            if (s.progress === 0) {
                Scripts.startDialogue(s, p, "./data/dialogue/stop_player.json");
                p.move(new Vector(0, 3));
            }
            else {
                Scripts.encounter(s, p, 0, 1, "./data/level/episode2.json", "./data/cutscene/cutscene_ep2_0.json", () => { Scripts.completeQuest(s, p, i); p.move(new Vector(-p.pos.x - 316, -p.pos.y - 580)); });
            }
        },
        params: [0]
    }
},
seePlay = {
    ontouch: {
        func: Scripts.encounter,
        params: [1, 2, "./data/level/play.json", "./data/cutscene/cutscene_ep2_1.json"]
    }
},
lastEncounter = {
    ontouch: {
        func: (s, p, i) => {
            Scripts.encounter(s, p, 2, i, "./data/level/episode2.json", "./data/cutscene/cutscene_ep2_2.json", () => { Scripts.completeQuest(s, p, i); p.move(new Vector(0, 65)); });
        },
        params: [3]
    }
},
alwaysSleep = {
    oninteract: {
        func: Scripts.sleep,
        params: [true]
    }
},
pushDown = {
    ontouch: {
        func: (s, p, a, b) => {
            if (s.day === a && s.progress === b) {
                p.move(new Vector(0, 5));
            }
        },
        params: [2, 4]
    }
},
final = {
    oninteract: {
        func: Scripts.ending,
        params: []
    }
};

export { quest1, doneQuest1, sleep, messenger, madHamlet, doneQuest2, inspectColumbine, inspectDaisy, inspectFennel, inspectPansy, inspectRosemary, inspectRue, inspectViolet,
    inspectViolet2, inspectDrawer, inspectDrawer2, nunnery, seePlay, lastEncounter, alwaysSleep, pushDown, final, inspectDrawer3 };
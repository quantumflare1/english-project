import Cutscene from "../cutscene.mjs";
import { SceneChangeEvent } from "../event.mjs";

import * as Scripts from "./scripts.mjs";

const quest1 = {
    ontouch: {
        func: Scripts.giveQuest,
        params: ["Say goodbye to Laertes", 0]
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
            Scripts.encounter(s, p, d, prog, l, c, Scripts.giveQuest, s, p, "Tell your father", 3);
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
};

export { quest1, doneQuest1, sleep, messenger, madHamlet, doneQuest2 };
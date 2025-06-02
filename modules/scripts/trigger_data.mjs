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
            Scripts.completeQuest(s, p, i);
            dispatchEvent(new SceneChangeEvent(new Cutscene("./data/level/episode1.angle", "./data/cutscene/cutscene_ep1_1.json", s)));
            s.removeNode(s.sprites[0]);
            s.removeNode(s.sprites[1]);
        },
        params: [0]
    }
},
sleep = {
    oninteract: {
        func: Scripts.sleep,
        params: []
    }
};

export { quest1, doneQuest1, sleep };
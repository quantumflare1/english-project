import * as Scripts from "./scripts.mjs";

const test = {
    ontouch: {
        func: Scripts.startDialogue,
        params: ["./data/dialogue/hamlet_ep1_0.json"]
    },
    animated: false
},
checkpoint = {
    ontouch: {
        func: Scripts.setSpawnPoint
    },
    animated: true
};

export { test, checkpoint };
import * as Scripts from "./scripts.mjs";

const test = {
    ontouch: {
        func: Scripts.startMove,
        params: [60, 30, 0]
    },
    whileActive: {
        func: Scripts.move
    },
    animated: false
},
checkpoint = {
    ontouch: {
        func: Scripts.setSpawnPoint
    },
    animated: true
},
grapple = {
    ontouch: {
        func: Scripts.givePlayerGrapple
    },
    animated: false
};

export { test, checkpoint, grapple };
import * as Scripts from "./scripts.mjs";

const quest1 = {
    ontouch: {
        func: Scripts.giveQuest,
        params: ["Say goodbye to Laertes", 0]
    }
},
quest2 = {
    ontouch: {
        func: Scripts.completeQuest,
        params: [0]
    }
};

export { quest1, quest2 };
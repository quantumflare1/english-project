import Text from "./text.mjs";

export default class Quest extends Text {
    id;

    constructor(text, id) {
        super(20, 50, 99, text, "start", "16px font-Pixellari", "white", "follow");
        this.id = id;
    }
}
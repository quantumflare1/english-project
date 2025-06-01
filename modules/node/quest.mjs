import Text from "./text.mjs";

export default class Quest extends Text {
    id;

    constructor(text, id) {
        super(10, 40, 99, text, "start", "16px font-Pixellari", "white", "follow");
        this.id = id;
    }
}
import { input, keybinds } from "../inputs.mjs";
import FilledRect from "./filled_rect.mjs";
import Text from "./text.mjs";
import Node from "./node.mjs";
import { PlayerFreezeEvent, PlayerUnfreezeEvent } from "../event.mjs";

const TEXT_SPEED = 3;

export default class Dialogue extends Node {
    data;
    entry;
    line;
    textBox;
    text; speaker;
    z = 10;
    display = "follow";
    active;
    textTicks; textFinished;

    constructor(path) {
        super();
        this.entry = 0;
        this.line = 0;
        this.textTicks = 0;
        this.textFinished = false;
        this.textBox = new FilledRect(5, 110, 310, 65, 10, "#000", "follow");
        this.text = new Text(80, 128, 11, "", "start", "14px font-NotJamSlab14");
        this.speaker = new Text(15, 128, 11, "", "start", "14px font-NotJamSlab14", "#ffcccc");
        this.active = false;

        this.init(path);
    }
    async init(path) {
        this.data = await (await fetch(path)).json();
        this.speaker.setText(this.data[this.entry].speaker);
    }
    update() {
        super.update();

        if (this.active) {
            if (input.impulse.has(keybinds.select)) {
                input.consumeInput(keybinds.select);
                if (this.textFinished) {
                    this.nextEntry();
                }
                else {
                    this.textTicks += 99999; // cant be assed anymore
                }
            }
            if (this.data && this.active) {
                this.textTicks++;
                this.text.setText(this.getOutputString());
            }
        }
    }
    activate() {
        this.active = true;
        dispatchEvent(new PlayerFreezeEvent());
    }
    nextEntry() {
        this.textTicks = 0;
        this.entry++;
        if (this.entry >= this.data.length && this.textFinished) {
            this.active = false;
            dispatchEvent(new PlayerUnfreezeEvent());
            return;
        }
        this.speaker.setText(this.data[this.entry].speaker);
        this.textFinished = false;
    }
    draw(ctx) {
        if (this.active) {
            this.textBox.draw(ctx);
            this.text.draw(ctx);
            this.speaker.draw(ctx);
        }
    }
    getOutputString() {
        let res = "";
        let remainder = Math.floor(this.textTicks/TEXT_SPEED);

        for (const i of this.data[this.entry].text) {
            let line = i.substring(0, remainder);
            remainder -= i.length;

            res += `\n${line}`;
            if (remainder < 0) {
                break;
            }
        }
        if (remainder >= 0) {
            this.textFinished = true;
        }
        return res.substring(1);
    }
}
import assets from "../data/config/assets.json" with { type: "json" };
import { AssetLoadEvent } from "./event.mjs";

export default class Assets {
    static spritesheet = new OffscreenCanvas(2000, 480); // couldn't figure dynamic resizing out so enjoy the hardcoded numbers
    static sprites = {};
    static spriteCtx = this.spritesheet.getContext("2d");
    static audio = [];
    static font = [];
    static async load() {
        let sprWidth = 0;
        let sprMaxHeight = 0;

        // renders every image into a big line
        for (let i = 0; i < assets.image.files.length; i++) {
            for (let j = 0; j < assets.image.files[i].length; j++) {
                const file = this.#getFile(`./data/assets/${assets.image.directories[i]}/${assets.image.files[i][j]}.png`);
                const json = this.#getJSON(`./data/img/${assets.image.directories[i]}/${assets.image.files[i][j]}.json`);

                await json.then((res) => {
                    if (res !== null) {
                        for (const i of res.sprite)
                            i[0] += sprWidth;
                        
                        this.sprites[assets.image.files[i][j]] = res;
                    }
                });

                // putting await here is an extremely quick and dirty fix maybe improve this later
                await file.then((res) => {
                    if (res !== null)
                        return createImageBitmap(res);
                }).then((res) => {
                    if (res) {
                        this.spriteCtx.drawImage(res, sprWidth, 0);
                        sprWidth += res.width;
                    }
                });
            }
        }

        // load audio
        for (let i = 0; i < assets.audio.files.length; i++) {
            for (let j = 0; j < assets.audio.files[i].length; j++) {
                const file = this.#getFile(`./data/assets/${assets.audio.directories[i]}/${assets.audio.files[i][j]}.ogg`);

                file.then((res) => {
                    const src = URL.createObjectURL(res);
                    this.audio.push(new Audio(src));
                });
            }
        }

        // load fonts
        for (let i = 0; i < assets.font.files.length; i++) {
            for (let j = 0; j < assets.font.files[i].length; j++) {
                const font = new FontFace(`${assets.font.directories[i]}-${assets.font.files[i][j]}`, `url(./data/assets/${assets.font.directories[i]}/${assets.font.files[i][j]}.ttf)`);

                await font.load();
                document.fonts.add(font);
            }
        }

        dispatchEvent(new AssetLoadEvent());
        console.log("done")
    }
    static async #getFile(path) {
        return await fetch(path).then(async (res) => {
            if (!res.ok) return null;
            return res.blob();
        });
    }
    static async #getJSON(path) {
        return await fetch(path).then(async (res) => {
            if (!res.ok) return null;
            return res.json();
        });
    }
}
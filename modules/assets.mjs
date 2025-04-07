import assets from "../data/config/assets.json" with { type: "json" };

export default class Assets {
    static spritesheet = new OffscreenCanvas(100, 100);
    static sprites = {};
    static spriteCtx = this.spritesheet.getContext("2d");
    static audio = [];
    static font = [];
    static load() {
        let sprWidth = 0;
        let sprMaxHeight = 0;

        // renders every image into a big line
        for (let i = 0; i < assets.image.files.length; i++) {
            for (let j = 0; j < assets.image.files[i].length; j++) {
                const file = this.#getFile(`./data/assets/${assets.image.directories[i]}/${assets.image.files[i][j]}.png`);
                const json = this.#getJSON(`./data/tile/${assets.image.files[i][j]}.json`);

                json.then((res) => {
                    for (const i of res.sprites)
                        i[0] += sprWidth;
                    
                    this.sprites[assets.image.files[i][j]] = res;
                });

                file.then((res) => {
                    return createImageBitmap(res);
                }).then((res) => {
                    if (res.height > sprMaxHeight)
                        sprMaxHeight = res.height;

                    this.spriteCtx.drawImage(res, sprWidth, 0);
                    sprWidth += res.width;
                });
            }
        }
        this.spritesheet.height = sprMaxHeight;
        this.spritesheet.width = sprWidth;

        // load audio
        for (let i = 0; i < assets.audio.files.length; i++) {
            for (let j = 0; j < assets.audio.files[i].length; j++) {
                const file = this.#getFile(`./data/assets/${assets.audio.directories[i]}/${assets.audio.files[i][j]}.ogg`);

                file.then((res) => {
                    if (!res.ok) throw new Error(`Couldn't get blob ${assets.audio.files[i][j]} (Error code: ${res.status})`);
                    const src = URL.createObjectURL(res);
                    this.audio.push(new Audio(src));
                });
            }
        }

        // load fonts
        for (let i = 0; i < assets.font.files.length; i++) {
            for (let j = 0; j < assets.font.files[i].length; j++) {
                const file = this.#getFile(`./data/assets/${assets.font.directories[i]}/${assets.font.files[i][j]}.ttf`);

                file.then((res) => {
                    if (!res.ok) throw new Error(`Couldn't get blob ${assets.font.files[i][j]} (Error code: ${res.status})`);
                    const src = URL.createObjectURL(res);
                    document.fonts.add(new FontFace(`font${i}-${j}`, `url(${src})`));
                    this.font.push(`font${i}-${j}`);
                });
            }
        }
    }
    static async #getFile(path) {
        return await fetch(path).then(async (res) => {
            if (!res.ok) throw new Error(`Couldn't load ${path} (Error code: ${res.status})`);
            return await res.blob();
        });
    }
    static async #getJSON(path) {
        return await fetch(path).then(async (res) => {
            if (!res.ok) throw new Error(`Couldn't load ${path} (Error code: ${res.status})`);
            return await res.json();
        });
    }
}
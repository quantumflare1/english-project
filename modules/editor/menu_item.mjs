import { EditorTileSelectEvent } from "../event.mjs";

export default class MenuItem {
    div;
    /**
     * 
     * @param {HTMLImageElement} img 
     * @param {string} type 
     * @param {string} name
     */
    constructor(img, type, name) {
        this.div = document.createElement("div");

        img.width *= 4;
        img.height *= 4;
        
        this.div.appendChild(img);
        this.div.id = `${type}_${name}`;

        this.div.classList.add("clickable", "tileOption");
        this.div.addEventListener("click", () => {
            dispatchEvent(new EditorTileSelectEvent(type, name));
        });
    }
}
// tbh this didn't really need to be a class but wtv
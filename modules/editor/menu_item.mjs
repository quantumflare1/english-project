export default class MenuItem {
    div;
    /**
     * 
     * @param {HTMLImageElement} img 
     * @param {string} type 
     */
    constructor(img, type) {
        this.div = document.createElement("div");

        img.width *= 4;
        img.height *= 4;
        
        this.div.appendChild(img);

        this.div.classList.add("clickable", "tileOption");
        this.div.addEventListener("click", () => {
            dispatchEvent("editor_tileselect", type);
        });
    }
}
// tbh this didn't really need to be a class but wtv
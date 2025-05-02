import Text from "../text.mjs";

// note to self in case i forget: shallowness is whether pressing z on this element changes its value or makes it changeable
export default class MenuElement extends Text {
    isSelected; isShallow; isHighlighted;
    up; down; left; right;
    interact;
    
    /**
     * 
     * @param {string} text 
     * @param {string} align 
     * @param {string} font 
     * @param {string} color
     * @param {string} display
     * @param {boolean} shallow 
     * @param {() => void} interact 
     */
    constructor(x, y, z = 10, text = "", align = "start", font = "16px Arial", color = "white", display = "follow", shallow = true, interact = () => {}) {
        super(x, y, z, text, align, font, color, display);
        this.isSelected = false;
        this.isShallow = shallow;
        this.interact = interact.bind(this);
    }
    toggleSelect() {
        this.isSelected = !this.isSelected;
    }
    toggleHighlight() {
        this.isHighlighted = !this.isHighlighted;
    }
    /**
     * 
     * @param {MenuElement} e 
     * @param {string} dir
     */
    connect(e, dir) {
        switch (dir) {
            case "up":
                this.up = e;
                e.down = this;
                break;
            case "down":
                this.down = e;
                e.up = this;
                break;
            case "left":
                this.left = e;
                e.right = this;
                break;
            case "right":
                this.right = e;
                e.left = this;
                break;
        }
    }
    update() {
        if (this.isSelected) {
            this.color = "yellow";
        }
        else if (this.isHighlighted) {
            this.color = "gray";
        }
        else {
            this.color = "white";
        }
    }
}
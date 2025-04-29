import Vector from "../misc/vector.mjs";

export default class Mouse {
    pos; pressed; movement;
    cssDimensions; pixelDimensions; 
    resizeObserver;
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.pos = new Vector(0, 0);
        this.movement = new Vector(0, 0);
        this.pressed = new Set();

        const canvasRect = canvas.getBoundingClientRect();
        this.cssDimensions = new Vector(canvasRect.width, canvasRect.height);
        this.pixelDimensions = new Vector(canvas.width, canvas.height);

        this.resizeObserver = new ResizeObserver(this.resize.bind(this));
        this.resizeObserver.observe(canvas);

        canvas.addEventListener("mousemove", this.move.bind(this));
        canvas.addEventListener("mousedown", (e) => {
            this.down.bind(this)(e);
        });
        canvas.addEventListener("mouseup", this.up.bind(this));
    }
    /**
     * 
     * @param {MouseEvent} e 
     */
    move(e) {
        const scaleFactor = this.pixelDimensions.x / this.cssDimensions.x;

        this.pos.x = e.offsetX;
        this.pos.y = e.offsetY;
        this.pos.multiply(scaleFactor);
        this.movement.x = e.movementX;
        this.movement.y = e.movementY;
        this.movement.multiply(scaleFactor);
    }
    /**
     * 
     * @param {MouseEvent} e 
     */
    down(e) {
        this.pressed.add(e.button);
    }
    /**
     * 
     * @param {MouseEvent} e 
     */
    up(e) {
        this.pressed.delete(e.button);
    }
    resize(entries, observer) {
        for (const i of entries) {
            const height = i.borderBoxSize[0].blockSize;
            const width = i.borderBoxSize[0].inlineSize;
            this.cssDimensions.x = width;
            this.cssDimensions.y = height;
        }
    }
}
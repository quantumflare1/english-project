export default class RoomData {
    static DEFAULT_WIDTH = 32;
    static DEFAULT_HEIGHT = 18;

    id;
    width; height;
    x; y;
    blocks; hazards; decals; triggers; specials;

    constructor(id, width, height, x, y) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        
        this.blocks = [];
        this.hazards = [];
        this.decals = [];
        this.triggers = [];
        this.specials = [];

        for (let i = 0; i < height; i++) {
            this.blocks[i] = [];
            this.hazards[i] = [];
            this.decals[i] = [];
            this.triggers[i] = [];
            this.specials[i] = [];

            for (let j = 0; j < width; j++) {
                this.blocks[i][j] = 0;
                this.hazards[i][j] = 0;
                this.decals[i][j] = 0;
                this.triggers[i][j] = 0;
                this.specials[i][j] = 0;
            }
        }
    }
}
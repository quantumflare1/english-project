import * as Level from "./level.mjs";
import * as Renderer from "./renderer.mjs";
import * as Player from "./player.mjs";

const TRANSITION_TIME = 30;
const CAMERA_WIDTH = 32;
const CAMERA_HEIGHT = 18;

const CENTER_OFFSET_X = CAMERA_WIDTH * 5 + Player.WIDTH / 2;
const CENTER_OFFSET_Y = CAMERA_HEIGHT * 5 + Player.HEIGHT / 2;

function smoothstep(n) {
    if (n > 1) return 1;
    if (n < 0) return 0;
    
    return (3 * n ** 2) - (2 * n ** 3);
}

class Camera {
    constructor() {
        this.x = Player.player.x - CENTER_OFFSET_X;
        this.y = Player.player.y - CENTER_OFFSET_Y;

        this.followFactor = 0;
        this.followTime = 0;
    }
    update() {
        // note: this is like. kinda broken (should be smooth)
        if (Player.player.isDead) {
            this.followFactor = 1;
        }
        else if (Player.player.x !== this.x + CENTER_OFFSET_X || Player.player.y !== this.y + CENTER_OFFSET_Y) {
            if (this.followTime < 0) {
                this.followTime = 0;
            }
            this.followTime++;
        }
        else {
            if (this.followTime > TRANSITION_TIME) {
                this.followTime = TRANSITION_TIME;
            }
            else {
                this.followTime--;
            }
        }
        this.followFactor = smoothstep(this.followTime / TRANSITION_TIME);

        const diffX = this.x + CENTER_OFFSET_X - Player.player.x;
        const diffY = this.y + CENTER_OFFSET_Y - Player.player.y;

        this.x -= diffX * this.followFactor;
        this.y -= diffY * this.followFactor;

        if (this.x < 0) this.x = 0;
        if (this.x + CAMERA_WIDTH * 10 > Level.level.rooms[Level.curRoomId].width * 10) this.x = Level.level.rooms[Level.curRoomId].width * 10 - CAMERA_WIDTH * 10;
        if (this.y < 0) this.y = 0;
        if (this.y + CAMERA_HEIGHT * 10 > Level.level.rooms[Level.curRoomId].height * 10) this.y = Level.level.rooms[Level.curRoomId].height * 10 - CAMERA_HEIGHT * 10;
        
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }
}

let camera;

function init() {
    camera = new Camera(0, 0);
}

export { Camera, init, camera };
class CameraMoveEvent extends CustomEvent {
    constructor(x, y, instant = false) {
        super("game_cameramove", { detail: { x: x, y: y, instant: instant } });
    }
}

class RoomChangeEvent extends CustomEvent {
    constructor(dir) {
        super("game_roomtransition", { detail: dir });
    }
}

export { RoomChangeEvent, CameraMoveEvent };
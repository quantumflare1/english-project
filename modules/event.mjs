class CameraMoveEvent extends CustomEvent {
    constructor(x, y) {
        super("game_cameramove", { detail: { x: x, y: y } });
    }
}

class CameraSnapEvent extends CustomEvent {
    constructor(x, y) {
        super("game_camerasnap", { detail: { x: x, y: y } });
    }
}

class CameraZoomEvent extends CustomEvent {
    constructor(zoom) {
        super("game_camerazoom", { detail: { zoom: zoom } });
    }
}

class RoomChangeEvent extends CustomEvent {
    constructor(dir) {
        super("game_roomtransition", { detail: dir });
    }
}

export { RoomChangeEvent, CameraSnapEvent, CameraMoveEvent, CameraZoomEvent };
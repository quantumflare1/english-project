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

class AssetLoadEvent extends CustomEvent {
    constructor() {
        super("game_assetloaded");
    }
}

class SceneLoadEvent extends CustomEvent {
    constructor() {
        super("game_sceneloaded");
    }
}

class SceneChangeEvent extends CustomEvent {
    constructor(scene) {
        super("game_scenechange", { detail: scene });
    }
}

class FreezeTimeEvent extends CustomEvent {
    constructor(ticks) {
        super("game_freezetime", { detail: ticks });
    }
}

class SettingsChangeEvent extends CustomEvent {
    constructor(name, value) {
        super("game_settingschange", { detail: { setting: name, value: value } });
    }
}

export { RoomChangeEvent, CameraSnapEvent, CameraMoveEvent, CameraZoomEvent, AssetLoadEvent, SceneLoadEvent, SceneChangeEvent, FreezeTimeEvent, SettingsChangeEvent };
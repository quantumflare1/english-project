class CameraMoveEvent extends CustomEvent {
    static code = "game_cameramove";
    constructor(x, y) {
        super(CameraMoveEvent.code, { detail: { x: x, y: y } });
    }
}

class CameraSnapEvent extends CustomEvent {
    static code = "game_camerasnap";
    constructor(x, y) {
        super(CameraSnapEvent.code, { detail: { x: x, y: y } });
    }
}

class CameraZoomEvent extends CustomEvent {
    static code = "game_camerazoom";
    constructor(zoom) {
        super(CameraZoomEvent.code, { detail: zoom });
    }
}

class RoomChangeEvent extends CustomEvent {
    static code = "game_roomchange";
    constructor(dir) {
        super(RoomChangeEvent.code, { detail: dir });
        console.log(dir.id)
    }
}

class AssetLoadEvent extends Event {
    static code = "game_assetload";
    constructor() {
        super(AssetLoadEvent.code);
    }
}

class SceneLoadEvent extends Event {
    static code = "game_sceneload";
    constructor() {
        super(SceneLoadEvent.code);
    }
}

class SceneChangeEvent extends CustomEvent {
    static code = "game_scenechange";
    constructor(scene) {
        super(SceneChangeEvent.code, { detail: scene });
    }
}

class FreezeTimeEvent extends CustomEvent {
    static code = "game_freezetime";
    constructor(ticks) {
        super(FreezeTimeEvent.code, { detail: ticks });
    }
}

class SettingsChangeEvent extends CustomEvent {
    static code = "game_settingschange";
    constructor(name, value) {
        super(SettingsChangeEvent.code, { detail: { setting: name, value: value } });
    }
}

class CursorMoveEvent extends CustomEvent {
    static code = "game_cursormove";
    constructor(newSelected) {
        super(CursorMoveEvent.code, { detail: newSelected });
    }
}

class FPSUpdateEvent extends CustomEvent {
    static code = "ui_fpschange";
    constructor(fps) {
        super(FPSUpdateEvent.code, { detail: fps });
    }
}

class TimeUpdateEvent extends CustomEvent {
    static code = "ui_timechange";
    constructor(fps) {
        super(TimeUpdateEvent.code, { detail: fps });
    }
}

class PlayerStateChangeEvent extends CustomEvent {
    static code = "game_playerstatechange";
    constructor(state) {
        super(PlayerStateChangeEvent.code, { detail: state });
    }
}

class PauseEvent extends Event {
    static code = "game_pause";
    constructor() {
        super(PauseEvent.code);
    }
}

class UnpauseEvent extends Event {
    static code = "game_unpause";
    constructor() {
        super(UnpauseEvent.code);
    }
}

class EditorRoomChangeEvent extends Event {
    static code = "editor_roomchange";
    constructor() {
        super(EditorRoomChangeEvent.code);
    }
}

class EditorTileSelectEvent extends CustomEvent {
    static code = "editor_tileselect";
    constructor(type, name) {
        super(EditorTileSelectEvent.code, { detail: {
            type: type,
            name: name
        }});
    }
}

class EditorImportEvent extends CustomEvent {
    static code = "editor_import";
    constructor(meta) {
        super(EditorImportEvent.code, { detail: meta });
    }
}

class PlayerKillEvent extends Event {
    static code = "game_playerkill";
    constructor() {
        super(PlayerKillEvent.code);
    }
}

class PlayerFreezeEvent extends Event {
    static code = "game_playerfreeze";
    constructor() {
        super(PlayerFreezeEvent.code);
    }
}

class PlayerUnfreezeEvent extends Event {
    static code = "game_playerunfreeze";
    constructor() {
        super(PlayerUnfreezeEvent.code);
    }
}

export {
    CameraSnapEvent, CameraMoveEvent, CameraZoomEvent,              // camera
    AssetLoadEvent,                                                 // assets
    SceneLoadEvent, SceneChangeEvent,                               // scene
    FreezeTimeEvent, PauseEvent, UnpauseEvent,                      // control
    RoomChangeEvent,                                                // room
    SettingsChangeEvent, CursorMoveEvent,                           // menu
    FPSUpdateEvent, TimeUpdateEvent,                                // ui
    PlayerStateChangeEvent, PlayerKillEvent, PlayerFreezeEvent, PlayerUnfreezeEvent,     // player
    EditorRoomChangeEvent, EditorTileSelectEvent, EditorImportEvent // editor
};
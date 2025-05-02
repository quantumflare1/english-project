const options = {
    showTimer: false,
    showFps: false
};

function setOption(setting, value) {
    options[setting] = value;
}

export { options, setOption };
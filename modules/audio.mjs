const bgm = new AudioContext();
let gainNode;
let source;
let isPlaying;

async function load(path) {
    source = bgm.createBufferSource();
    source.buffer = await bgm.decodeAudioData(
        await (await fetch(path)).arrayBuffer() // three promises??? in one statement???
    );

    gainNode = bgm.createGain();
    source.connect(gainNode)
        .connect(bgm.destination);

    source.loop = true;

    isPlaying = false;
}
function setVolume(volume) {
    gainNode.gain.setValueAtTime(volume, bgm.currentTime);
}
function play() {
    source.start();
    isPlaying = true;
}
function close() {
    source.stop();
    bgm.close();
    isPlaying = false;
}

export { isPlaying, load, setVolume, play, close };
const input = {
    continuous: new Set(),
    impulse: new Set(),
    /**
     * 
     * @param {string} key 
     */
    consumeInput(key) {
        this.impulse.delete(key);
    }
};

/**
 * 
 * @param {KeyboardEvent} e 
 */
function keydown(e) {
    if (e.repeat) return;
    input.continuous.add(e.key.toLowerCase());
    input.impulse.add(e.key.toLowerCase());
};

/**
 * 
 * @param {KeyboardEvent} e 
 */
function keyup(e) {
    input.continuous.delete(e.key.toLowerCase());
    input.impulse.delete(e.key.toLowerCase());
};

addEventListener("keydown", keydown);
addEventListener("keyup", keyup);

export default input;
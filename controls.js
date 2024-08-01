let keys = {
    KeyW: false,
    KeyS: false,
    ArrowUp: false,
    ArrowDown: false
};

window.addEventListener("keydown", keyDown);
function keyDown(event) {
    const key = event.code;
    // console.log(`KEYDOWN: ${key}`);
    switch (key) {
        case "KeyW":
            keys.KeyW = true;
            break;
        case "KeyS":
            keys.KeyS = true;
            break;
        case "ArrowUp":
            keys.ArrowUp = true;
            event.preventDefault();
            break;
        case "ArrowDown":
            keys.ArrowDown = true;
            event.preventDefault();
            break;
        case "Backspace":
            resetGame();
            break;
    }
}

window.addEventListener("keyup", keyUp);
function keyUp(event) {
    const key = event.code;
    // console.log(`KEYUP: ${key}`);
    switch (key) {
        case "KeyW":
            keys.KeyW = false;
            break;
        case "KeyS":
            keys.KeyS = false;
            break;
        case "ArrowUp":
            keys.ArrowUp = false;
            event.preventDefault();
            break;
        case "ArrowDown":
            keys.ArrowDown = false;
            event.preventDefault();
            break;
        case "Backspace":
            resetGame();
            break;
    }
}
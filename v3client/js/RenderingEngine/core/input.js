const LAST_KEY_CODE = 222;
let keyState = new Array(222).fill(0);
let previousKeyState = [...keyState];
/**
 * Information about movement relevant to the game.
 * @type {[keyDirection: number, mouseClicked: number, mouseAngleFromCenter: number, mouseDistanceFromCenter: number, mousePositionX: number, mousePositionY: number]}
 */
let gameMovement = [0, 0, 0, 0, 0, 0];
let previousGameMovement = [...gameMovement];
/**
 * @param {KeyboardEvent} e
 */
const handlekeyUp = (e) => {
    const { code } = e;
    if (e.ctrlKey) return;
    //Bit 1 is Up. 2 is Left. 3 is Down. 4 is Right. 5 is Shift. 6 is E. 7 is R
    if ((code === 'KeyW' || code === 'ArrowUp') && gameMovement[0] & 1) gameMovement[0]--;
    if ((code === 'KeyA' || code === 'ArrowLeft') && gameMovement[0] & 2) gameMovement[0] -= 2;
    if ((code === 'KeyS' || code === 'ArrowDown') && gameMovement[0] & 4) gameMovement[0] -= 4;
    if ((code === 'KeyD' || code === 'ArrowRight') && gameMovement[0] & 8) gameMovement[0] -= 8;
    if (code === 'ShiftLeft' && gameMovement[0] & 16) gameMovement[0] -= 16;
    if (code === 'KeyE' && gameMovement[0] & 32) gameMovement[0] -= 32;
    if (code === 'KeyR' && gameMovement[0] & 64) gameMovement[0] -= 64;
};
/**
 * @param {KeyboardEvent} e
 */
const handlekeyDown = (e) => {
    const { code } = e;
    if (e.ctrlKey) return;
    //Bit 1 is Up. 2 is Left. 3 is Down. 4 is Right. 5 is Shift. 6 is E. 7 is R
    if ((code === 'KeyW' || code === 'ArrowUp') && !(gameMovement[0] & 1)) gameMovement[0]++;
    if ((code === 'KeyA' || code === 'ArrowLeft') && !(gameMovement[0] & 2)) gameMovement[0] += 2;
    if ((code === 'KeyS' || code === 'ArrowDown') && !(gameMovement[0] & 4)) gameMovement[0] += 4;
    if ((code === 'KeyD' || code === 'ArrowRight') && !(gameMovement[0] & 8)) gameMovement[0] += 8;
    if (code === 'ShiftLeft' && !(gameMovement[0] & 16)) gameMovement[0] += 16;
    if (code === 'KeyE' && !(gameMovement[0] & 32)) gameMovement[0] += 32;
    if (code === 'KeyR' && !(gameMovement[0] & 64)) gameMovement[0] += 64;
};
/**
 * Converts event data into relevant movement data
 * @param {KeyboardEvent} e
 */
const handleDirection = (e) => {
    //hover = null;
    gameMovement[4] = e.clientX;
    gameMovement[5] = e.clientY;
    let radians2 = Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2) * -1;
    gameMovement[2] = ((radians2 < 0 ? radians2 + Math.PI * 2 : radians2) / Math.PI / 2) * 255;
    gameMovement[3] = Math.round(
        Math.sqrt(Math.pow(window.innerWidth / 2 - e.clientX, 2) + Math.pow(window.innerHeight / 2 - e.clientY, 2)),
    );
    if (gameMovement[3] > 255) gameMovement[3] = 255;
};
const handlemouseMove = (e) => {
    handleDirection(e);
};
const handlemouseUp = (e) => {
    handleDirection(e);
    gameMovement[1] = 0;
};
const handlemouseDown = (e) => {
    handleDirection(e);
    gameMovement[1] = 1;
};
const startCapturing = () => {
    document.addEventListener('mousemove', handlemouseMove);
    document.addEventListener('mouseup', handlemouseUp);
    document.addEventListener('mousedown', handlemouseDown);
    document.addEventListener('keyup', handlekeyUp);
    document.onkeydown = (e) => {
        if (e.ctrlKey) {
            switch (e.keyCode) {
                case 68:
                    //       devMode = !devMode;
                    return false;
                    break;
                default:
                    return true;
                    break;
            }
        }
    };
    document.addEventListener('keydown', handlekeyDown);
    return gameMovement;
};
const stopCapturing = () => {
    document.removeEventListener('mousemove', handlemouseMove);
    document.removeEventListener('mousedown', handlemouseDown);
    document.removeEventListener('mouseup', handlemouseUp);
    document.removeEventListener('keyup', handlekeyUp);
    document.onkeydown = null;
    document.removeEventListener('keydown', handlekeyDown);
};
const hasChanged = () => {
    let movementValues = [...gameMovement];
    for (let i = movementValues.length; i--; ) {
        if (!(movementValues[i] == previousGameMovement[i])) {
            previousGameMovement = [...gameMovement];
            return true;
        }
    }
    return false;
};
RenderingEngine.Input = {
    startCapturing,
    stopCapturing,
    hasChanged,
    gameMovement,
    keyState,
};

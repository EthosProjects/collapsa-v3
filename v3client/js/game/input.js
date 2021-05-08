const movement = [0, 0, 0, 0, 0, 0];
let hover = null;
/*
{
    key: 0,
    pressingAttack: 0,
    angle: 0,
    mousedis: 0,
    x: 0,
    y: 0,
};
*/
//Handles keyUp and down
const handlekeyUp = (e) => {
    //        if (movement.chatting) return;
    let key = e.keyCode;
    //Bit 1 is Up. 2 is Left. 3 is Down. 4 is Right. 5 is Shift. 6 is E. 7 is R
    if (key == 87 || (key == 38 && movement[0] & 1)) movement[0]--;
    if (key == 65 || key == 37) movement[0] -= 2;
    if (key == 83 || key == 40) movement[0] -= 4;
    if (key == 68 || key == 39) movement[0] -= 8;
    if (key == 16) movement[0] -= 16;
    if (key == 69) movement[0] -= 32;
    if (key == 82) movement[0] -= 64;
};
const handlekeyDown = (e) => {
    //if (e.ctrlKey) return false;
    //      if (movement.chatting) return;
    let key = e.keyCode;
    //Bit 1 is Up. 2 is Left. 3 is Down. 4 is Right. 5 is Shift. 6 is E. 7 is R
    if ((key == 87 || key == 38) && !(movement[0] & 1)) movement[0]++;
    if ((key == 65 || key == 37) && !(movement[0] & 2)) movement[0] += 2;
    if ((key == 83 || key == 40) && !(movement[0] & 4)) movement[0] += 4;
    if ((key == 68 || key == 39) && !(movement[0] & 8)) movement[0] += 8;
    if (key == 16 && !(movement[0] & 16)) movement[0] += 16;
    if (key == 69 && !(movement[0] & 32)) movement[0] += 32;
    if (key == 82 && !(movement[0] & 64)) movement[0] += 64;
    if (key > 48 && key < 58) {
        ws.send(new Uint8Array([constants.MSG_TYPES.EQUIP_ITEM, key * 2 - 98]).buffer);
        console.log([constants.MSG_TYPES.EQUIP_ITEM, key * 2 - 98]);
    }
    if (key === 69) ws.send(new Uint8Array([constants.MSG_TYPES.ACTION_KEY]).buffer);
};

//Handles mouse changes:
const handleDirection = (e) => {
    hover = null;
    movement[4] = e.clientX;
    movement[5] = e.clientY;
    movement[2] =
        (Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2) / Math.PI / 2) * 255;
    movement[3] = Math.round(
        Math.sqrt(Math.pow(window.innerWidth / 2 - e.clientX, 2) + Math.pow(window.innerHeight / 2 - e.clientY, 2)),
    );
    if (movement[3] > 255) movement[3] = 255;
    /*if (!clientPlayer) return;
    for (let i = 0; i < clientPlayer.inventory.length; i += 2) {
        if (
            e.clientX > canvas.width / 10 + ((canvas.width / 10) * i) / 2 - 45 &&
            e.clientX < canvas.width / 10 + ((canvas.width / 10) * i) / 2 - 45 + 90 &&
            e.clientY > canvas.height - 135 &&
            e.clientY < canvas.height - 135 + 90
        ) {
            hover = [items[clientPlayer.inventory[i]], i];
            return;
        }
    }*/
};
const handlemouseMove = (e) => {
    handleDirection(e);
};
const handlemouseUp = (e) => {
    handleDirection(e);
    movement[1] = 0;
};
const handlemouseDown = (e) => {
    handleDirection(e);
    /*let currHandCraftableItems = [];
    if (!clientPlayer) return;
    checkCraft: for (let i = 0; i < handCraftableItems.length; i++) {
        let data = handCraftableItems[i].data;
        for (let i = 10; i < data.length; i += 2) {
            let possibles = [];
            let accrued = 0;
            for (let j = 0; j < clientPlayer.inventory.length; j += 2) {
                if (!(data[i] === clientPlayer.inventory[j])) continue;
                possibles.push(j);
                accrued += clientPlayer.inventory[j + 1];
            }
            if (accrued < data[i + 1]) {
                continue checkCraft;
            }
        }
        currHandCraftableItems.push(handCraftableItems[i]);
    }
    for (let i = 0; i < currHandCraftableItems.length; i++) {
        if (
            e.clientX > 90 + (i % 2 == 1 ? 80 : 0) &&
            e.clientX < 90 + (i % 2 == 1 ? 80 : 0) + 60 &&
            e.clientY > 90 + Math.floor(i / 2) * 80 &&
            e.clientY < 90 + Math.floor(i / 2) * 80 + 60
        ) {
            ws.send(new Uint8Array([constants.MSG_TYPES.CRAFT_ITEM, currHandCraftableItems[i].data[0]]).buffer);
            return;
        }
    }
    for (let i = 0; i < clientPlayer.inventory.length; i += 2) {
        if (items[clientPlayer.inventory[i]].data[3] === 0 && e.button === 0) continue;
        if (
            e.clientX > canvas.width / 10 + ((canvas.width / 10) * i) / 2 - 45 &&
            e.clientX < canvas.width / 10 + ((canvas.width / 10) * i) / 2 - 45 + 90 &&
            e.clientY > canvas.height - 135 &&
            e.clientY < canvas.height - 135 + 90
        ) {
            if (e.button === 0) ws.send(new Uint8Array([constants.MSG_TYPES.EQUIP_ITEM, i]).buffer);
            else if (e.button === 2) ws.send(new Uint8Array([constants.MSG_TYPES.DROP_ITEM, i]).buffer);
            return;
        }
    }*/
    movement[1] = 1;
};
const startCapturingInput = () => {
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
    return movement;
};
const stopCapturingInput = () => {
    document.removeEventListener('mousemove', handlemouseMove);
    document.removeEventListener('mousedown', handlemouseDown);
    document.removeEventListener('mouseup', handlemouseUp);
    document.removeEventListener('keyup', handlekeyUp);
    document.onkeydown = null;
    document.removeEventListener('keydown', handlekeyDown);
};
export { startCapturingInput, movement, stopCapturingInput };

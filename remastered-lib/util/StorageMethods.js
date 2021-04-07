import fs from 'fs';
const items = JSON.parse(fs.readFileSync('./items.json', 'utf8'));
const StorageMethods = {
    addItem: (storage, item) => {
        let storageUint8 = new Uint8Array(storage);
        let itemUint8 = new Uint8Array(item);
        let itemData = items[itemUint8[0]];
        let sameSlots = [];
        let emptySlots = [];
        for (let i = 0; i < storageUint8.byteLength; i += 2) {
            if (storageUint8[i] === itemUint8[0]) sameSlots.push(i);
            else if (storageUint8[i] === 0) emptySlots.push(i);
        }
        for (let i = 0; i < sameSlots.length; i++) {
            let capacity = itemData.data[2];
            if (itemUint8[1] + storageUint8[sameSlots[i] + 1] < capacity) {
                storageUint8[sameSlots[i] + 1] += itemUint8[1];
                itemUint8[1] = 0;
                break;
            } else {
                itemUint8[1] -= capacity - storageUint8[sameSlots[i] + 1];
                storageUint8[sameSlots[i] + 1] = capacity;
            }
        }
        for (let i = 0; i < emptySlots.length; i++) {
            if (itemUint8[1] === 0) break;
            let capacity = itemData.data[2];
            if (itemUint8[1] <= capacity) {
                storageUint8[emptySlots[i]] = itemUint8[0];
                storageUint8[emptySlots[i] + 1] = itemUint8[1];
                itemUint8[1] = 0;
                break;
            } else {
                storageUint8[emptySlots[i]] = itemUint8[0];
                storageUint8[emptySlots[i] + 1] = capacity;
                itemUint8[1] -= capacity;
            }
        }
        return item;
    },
    craftItem: (storage, item) => {
        let storageUint8 = new Uint8Array(storage);
        let itemUint8 = new Uint8Array(item);
        let itemData = items[itemUint8[0]].data;
        if (itemData[8] === 0) return console.log('This item is not craftable');
        for (let i = 10; i < itemData.length; i += 2) {
            let possibles = [];
            let accrued = 0;
            for (let j = 0; j < storageUint8.byteLength; j += 2) {
                if (!(itemData[i] === storageUint8[j])) continue;
                possibles.push(j);
                accrued += storageUint8[j + 1];
            }
            if (accrued < itemData[i + 1]) return console.log('Not enough ' + items[itemData[i]].name);
            let currIngredient = [itemData[i], itemData[i + 1]];
            for (let j = 0; j < possibles.length; j++) {
                if (storageUint8[possibles[j] + 1] <= currIngredient[1]) {
                    currIngredient[1] -= storageUint8[possibles[j] + 1];
                    storageUint8[possibles[j] + 1] = 0;
                    storageUint8[possibles[j]] = 0;
                    if (currIngredient === 0) break;
                } else {
                    storageUint8[possibles[j] + 1] -= currIngredient[1];
                    currIngredient[1] = 0;
                    break;
                }
            }
        }
        StorageMethods.addItem(storage, item);
    },
    arrayToBuffer: (arr) => new Uint8Array(arr).buffer,
};
export default StorageMethods;

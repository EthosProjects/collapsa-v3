const getArrayChange = (array1, array2) => {
    let toAdd = [];
    let toRemove = [];
    for (let i = 0; i < array1.length; i++) {
        toAdd[i] = [];
        toRemove[i] = [];
        for (let j = 0, k = 0, l = 0, m = 0; j < array1[i].length || k < array2[i].length; ) {
            let n1 = array1[i][j];
            let n2 = array2[i][k];
            if (n1 === n2) {
                j++;
                k++;
            } else {
                if (n1 > n2 || n1 === undefined) {
                    toAdd[i].push(n2);
                    k++;
                } else if (n1 < n2 || n2 === undefined) {
                    toRemove[i].push(n1);
                    j++;
                }
            }
        }
    }
    return [toAdd, toRemove];
};
export default getArrayChange;

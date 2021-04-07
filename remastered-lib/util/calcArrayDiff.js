const calcArrayDiff = (array1, array2) => {
    let baseArray1 = [];
    let baseArray2 = [];
    for (let i = 0; i < array1.length; i++) {
        baseArray1[i] = [];
        baseArray2[i] = [];
        for (let j = 0, k = 0, l = 0, m = 0; j < array1[i].length || k < array2[i].length; ) {
            let n1 = array1[i][j];
            let n2 = array2[i][k];
            if (n1 === n2) {
                baseArray1[i][l] = n1;
                baseArray2[i][m] = n2;
                j++;
                k++;
                l++;
                m++;
            } else {
                if (n1 > n2 || n1 === undefined) {
                    baseArray1[i][l] = -1;
                    baseArray2[i][m] = n2;
                    k++;
                    l++;
                    m++;
                } else if (n1 < n2 || n2 === undefined) {
                    baseArray1[i][l] = n1;
                    baseArray2[i][m] = -1;
                    j++;
                    l++;
                    m++;
                }
            }
        }
    }
    return [baseArray1, baseArray2];
};
module.exports = calcArrayDiff;

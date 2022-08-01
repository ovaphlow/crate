export const convertArray2Object = (a) => {
    const r = {};
    for (let i = 0; i < a.length; i += 2) {
        r[a[i]] = a[i + 1];
    }
    return r;
};

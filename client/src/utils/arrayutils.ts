export const toggleArrayElement = (e: any, arr: any[]) => {
    if (arr.includes(e)) {
        return arr.filter(id => id !== e)
    } else {
        return [...arr, e]
    }
}

export const addItemToLocation = (location: 'top' | 'bottom' | number, item: any, arr: any) => {
    if (location === 'top') {
        return [item, ...arr]
    } else if (location === 'bottom') {
        return [...arr, item]
    } else {
        return arr.splice(location + 1, 0, item)
    }
}

export const scaleNums = (arr: number[], scaledMin: number, scaledMax: number) => {
    var max = Math.max.apply(Math, arr);
    var min = Math.min.apply(Math, arr);
    return arr.map(num => scaleNum(num, min, max, scaledMin, scaledMax))
}

export const scaleNum = (num: number, min: number, max: number, scaledMin: number, scaledMax: number) => Math.max(scaledMin, (scaledMax-scaledMin) * Math.max((num-min), 1) / (max-min))

export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}
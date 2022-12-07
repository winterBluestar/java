function process(input) {

    let list = []
    for (let i = 0; i < 3; i++) {
        const subArr = ['[' + i + ']' + 1, '[' + i + ']' + 2, '[' + i + ']' + 3]
        list.push.apply(list, subArr)
    }
    return list
}
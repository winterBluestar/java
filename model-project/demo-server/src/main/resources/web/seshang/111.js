function process(input) {
    const currentDate = new Date();
    const localTime = currentDate.toLocaleDateString()
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    const day = currentDate.getUTCDay();



    return '本地时间：' + localTime + '，年：' + year + '月：' + month + '日：' + day
}
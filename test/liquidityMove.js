
let curPrice0 = 0.06;//eth/btc

let halfRange = 1; //%,  范围越大，损耗越大，倍数关系
let outRange = 0 //脱离低价的范围，脱离越大，损耗越大

let amountA0 = 6; //btc amount
let amountB0 = 6 / curPrice0; // eth amount

// let {amountA, amountB, newPrice, aValue0, bValue0, aValue1, bValue1} = calOneStep(amountA0, amountB0, curPrice0);

let amountA = amountA0;
let amountB = amountB0;
let curPrice = curPrice0;
let aValue0, bValue0;
let result;

for(var i = 0; i < 74; i++) {
    result = calOneStep(amountA, amountB, curPrice);
    amountA = result.amountA;
    amountB = result.amountB;
    curPrice = result.newPrice;
    if(!aValue0) {
        aValue0 = result.aValue0
        bValue0 = result.bValue0
    }
}

console.log("****************************************************************")
console.log("原始eth数量：" + amountB0)
console.log("原始btc数量：" + amountA0);
console.log("等效eth数量：" + bValue0)
console.log("等效btc数量：" + aValue0)
console.log("****************************************************************")
console.log("新仓位eth数量：" + amountB);
console.log("新仓位btc数量：" + amountA);
console.log("等效eth数量：" + result.bValue1)
console.log("等效btc数量：" + result.aValue1)
console.log("****************************************************************")
console.log("btc损耗: " + (aValue0 - result.aValue1)*100/aValue0)
console.log("eth增益: " + (result.bValue1 - bValue0)*100/bValue0)

function calOneStep(amountA, amountB, curPrice) {
    let aValue0 = amountB * curPrice + amountA;
    let bValue0 = amountB + amountA / curPrice;

    // console.log("原始eth数量：" + amountB)
    // console.log("原始btc数量：" + amountA);
    // console.log("等效eth数量：" + bValue0)
    // console.log("等效btc数量：" + aValue0)

    let averagePrice = curPrice * (1 - halfRange/2/100);
    amountB += amountA / averagePrice;
    // console.log("-------------------")
    // console.log("出界时eth数量：" + amountB)
    // console.log("出界时btc数量：" + 0);
    // console.log("等效eth数量：" + amountB)
    // console.log("等效btc数量：" + amountB * curPrice)

    let newPrice = curPrice * (1 - halfRange/100 - outRange/100 - halfRange/100);
    amountB = amountB / 2;
    amountA = amountB * newPrice;

    let aValue1 = amountB * newPrice + amountA;
    let bValue1 = amountB + amountA / newPrice;

    // console.log("-------------------")
    // console.log("新仓位eth数量：" + amountB);
    // console.log("新仓位btc数量：" + amountA);
    // console.log("等效eth数量：" + bValue1)
    // console.log("等效btc数量：" + aValue1)

    // console.log("btc损耗: " + (aValue0 - aValue1)*100/aValue0)
    // console.log("eth增益: " + (bValue1 - bValue0)*100/bValue0)

    return {amountA, amountB, newPrice, aValue0, bValue0, aValue1, bValue1}
}

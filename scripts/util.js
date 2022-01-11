const {Token, Price} = require('@uniswap/sdk-core')
const JSBI = require("jsbi")
const {encodeSqrtRatioX96, tickToPrice, priceToClosestTick, TickMath} = require('@uniswap/v3-sdk')

const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2))

module.exports = {
  floatToTick: function(f) {
    var fn = this.floatToInt(f);

    const sqrtRatioX96 = encodeSqrtRatioX96(fn.f, fn.d);

    let tick = TickMath.getTickAtSqrtRatio(sqrtRatioX96);

    var diff = Math.abs(f - this.tickToFloat(tick));
    var diff0 = Math.abs(f - this.tickToFloat(tick - 1));
    var diff1 = Math.abs(f - this.tickToFloat(tick + 1));
    if(diff0 < diff) {
      diff = diff0;
      tick = tick - 1;
    }
    if(diff1 < diff) {
      tick = tick + 1;
    }
    return tick

  },
  tickToFloat: function(tick, decimals = -1) {
    const sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick)
    var f = this.x96ToFloat(sqrtRatioX96);
    if(decimals >= 0) f = parseFloat(f.toFixed(decimals))
    return f;
  },
  floatToX96: function(f) {
    const tick = this.floatToTick(f);
    const sqrtPrice = TickMath.getSqrtRatioAtTick(tick)
    return `0x${sqrtPrice.toString(16)}`;
  },
  ticktToX96: function(tick) {
    const sqrtPrice = TickMath.getSqrtRatioAtTick(tick)
    return `0x${sqrtPrice.toString(16)}`;
  },
  x96ToFloat: function(sqrtRatioX96) {
    sqrtRatioX96 = JSBI.BigInt(sqrtRatioX96)
    const ratioX192 = JSBI.multiply(sqrtRatioX96, sqrtRatioX96)
    return JSBI.toNumber(ratioX192) / JSBI.toNumber(Q192)
  },
  /**
   * convert a float number to a integer and a divider
   * for example: 26.56 => {2656, 100}
   * @param {float} f
   * @returns {f, dn}
   */
  floatToInt: function(f, decimals = 0) {
    if(decimals <= 0) {
      decimals = this.getFloatDecimals(f);
    }
    var dn = 10 ** decimals;
    f = f * dn;
    return {f: parseInt(f.toFixed(0)), d: dn}
  },
  getFloatDecimals: function(f) {
      var strPrice = f.toString();
      var dotIndex = strPrice.indexOf(".");
      var decimals = 0;
      if(dotIndex > -1) decimals = strPrice.length - 1 - dotIndex;
      return decimals;
  },
  toHex: function(jsbiNumber) {
    const bigInt = JSBI.BigInt(jsbiNumber)
    let hex = bigInt.toString(16)
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    return `0x${hex}`
  }
}

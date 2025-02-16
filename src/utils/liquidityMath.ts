import bn from "bignumber.js";
import { getFeeTierPercentage } from "./helper";
import { encodePriceSqrt, expandDecimals } from "./math";
import { TickMath } from "@uniswap/v3-sdk"
import JSBI from 'jsbi'
import {Token, Price} from '@uniswap/sdk-core'
import { tickToPrice } from "@uniswap/v3-sdk"

// used in liquidity amount math
const Q96_ = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96))
const Q192 = JSBI.exponentiate(Q96_, JSBI.BigInt(2))

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const Q96 = new bn(2).pow(96);
const mulDiv = (a: bn, b: bn, multiplier: bn) => {
  return a.multipliedBy(b).div(multiplier);
};

export const getTickFromPrice = (
  price: number,
  token0Decimal: string,
  token1Decimal: string
): number => {
  const token0 = expandDecimals(price, Number(token0Decimal));
  const token1 = expandDecimals(1, Number(token1Decimal));
  const sqrtPrice = encodePriceSqrt(token1).div(encodePriceSqrt(token0))
  return Math.log(sqrtPrice.toNumber()) / Math.log(Math.sqrt(1.0001));
};

export const getPriceFromTick = (
  tick: number,
  token0Decimal: string,
  token1Decimal: string
): number => {
  const sqrtPrice = new bn(Math.pow(Math.sqrt(1.0001), tick));//.multipliedBy(Q96);
  const token0 = expandDecimals(1, Number(token0Decimal));
  const token1 = expandDecimals(1, Number(token1Decimal));
  const L2 = encodePriceSqrt(token0).multipliedBy(encodePriceSqrt(token1))
  const price = L2.div(sqrtPrice)
    .div(Q96.pow(2))
    .div(new bn(10).pow(token0Decimal))
    .pow(2);

  return price.toNumber();
};

// for calculation detail, please visit README.md (Section: Calculation Breakdown, No. 1)
export const getTokenAmountsFromDepositAmounts = (
  P: number,
  Pl: number,
  Pu: number,
  priceUSDX: number,
  priceUSDY: number,
  targetAmounts: number
) => {
  const deltaL =
    targetAmounts /
    ((Math.sqrt(P) - Math.sqrt(Pl)) * priceUSDY +
      (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu)) * priceUSDX);

  let deltaY = deltaL * (Math.sqrt(P) - Math.sqrt(Pl));
  if (deltaY * priceUSDY < 0) deltaY = 0;
  if (deltaY * priceUSDY > targetAmounts) deltaY = targetAmounts / priceUSDY;

  let deltaX = deltaL * (1 / Math.sqrt(P) - 1 / Math.sqrt(Pu));
  if (deltaX * priceUSDX < 0) deltaX = 0;
  if (deltaX * priceUSDX > targetAmounts) deltaX = targetAmounts / priceUSDX;

  return { amount0: deltaX, amount1: deltaY };
};

// for calculation detail, please visit README.md (Section: Calculation Breakdown, No. 2)
const getLiquidityForAmount0 = (
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  amount0: bn
): bn => {
  // amount0 * (sqrt(upper) * sqrt(lower)) / (sqrt(upper) - sqrt(lower))
  const intermediate = mulDiv(sqrtRatioBX96, sqrtRatioAX96, Q96);
  return mulDiv(amount0, intermediate, sqrtRatioBX96.minus(sqrtRatioAX96));
};

const getLiquidityForAmount1 = (
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  amount1: bn
): bn => {
  // amount1 / (sqrt(upper) - sqrt(lower))
  return mulDiv(amount1, Q96, sqrtRatioBX96.minus(sqrtRatioAX96));
};

export const getSqrtPriceX96 = (
  price: number,
  token0Decimal: string,
  token1Decimal: string
): bn => {
  const token0 = expandDecimals(price, Number(token0Decimal));
  const token1 = expandDecimals(1, Number(token1Decimal));
  // return mulDiv(encodePriceSqrt(token1), Q96, encodePriceSqrt(token0)).div(
  //   Q96
  // );
  return token0.div(token1).sqrt().multipliedBy(Q96);
};

export const getLiquidityForAmounts = (
  sqrtRatioX96: bn,
  sqrtRatioAX96: bn,
  sqrtRatioBX96: bn,
  _amount0: number,
  amount0Decimal: number,
  _amount1: number,
  amount1Decimal: number
): bn => {
  const amount0 = expandDecimals(_amount0, amount0Decimal);
  const amount1 = expandDecimals(_amount1, amount1Decimal);

  let liquidity: bn;
  if (sqrtRatioX96.lte(sqrtRatioAX96)) {
    liquidity = getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
  } else if (sqrtRatioX96.lt(sqrtRatioBX96)) {
    const liquidity0 = getLiquidityForAmount0(
      sqrtRatioX96,
      sqrtRatioBX96,
      amount0
    );
    const liquidity1 = getLiquidityForAmount1(
      sqrtRatioAX96,
      sqrtRatioX96,
      amount1
    );

    liquidity = bn.min(liquidity0, liquidity1);
  } else {
    liquidity = getLiquidityForAmount1(sqrtRatioAX96, sqrtRatioBX96, amount1);
  }

  return liquidity;
};

export const calculateFee = (
  liquidityDelta: bn,
  liquidity: bn,
  volume24H: number,
  _feeTier: string
): number => {
  const feeTier = getFeeTierPercentage(_feeTier);
  const liquidityPercentage = liquidityDelta
    .div(liquidity.plus(liquidityDelta))
    .toNumber();

  return feeTier * volume24H * liquidityPercentage;
};

console.log("fuck", getPriceFromTick(186700, "6", '18'))
console.log("fuck", getPriceFromTick(200450, "6", '18'))

console.log(getTickFromPrice(7800.4, "6", '18'))
console.log(getTickFromPrice(1972.6, '6', '18'))

var token0 = new Token(1, '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 18, "ETH")
var token1 = new Token(1, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 6, "USDC")
var p0 = tickToPrice(token0, token1, 186700)
var p1 = tickToPrice(token0, token1, 200450)
console.log(p0.toSignificant(5), p1.toSignificant(5))

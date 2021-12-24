

/**
 * http://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
 */

export class Pool {
    pa: number
    pb: number
    L: number
    constructor(pa: number, pb: number, p: number, x: number, y: number) {
        this.pa = Math.sqrt(pa);
        this.pb = Math.sqrt(pb);
        this.L = this.calL(p, x, y);
        console.log("L: " + this.L);
    }
    /**
   * calculate Liquidity
   * The liquidity amount is calculated from the following numbers that describe a position:
   * amount of token 0 (amt0), amount of token 1 (amt1), price (as x token 1's per token 0) at the upper limit of the position (upper),
   * price at the lower limit of the position (lower) and the current swap price (cprice). Then liquidity for a position is calculated as follows:
  
      Case 1: cprice <= lower
      liquidity = amt0 * (sqrt(upper) * sqrt(lower)) / (sqrt(upper) - sqrt(lower))
  
      Case 2: lower < cprice <= upper
      liquidity is the min of the following two calculations:
      amt0 * (sqrt(upper) * sqrt(cprice)) / (sqrt(upper) - sqrt(cprice))
      amt1 / (sqrt(cprice) - sqrt(lower))
  
      Case 3: upper < cprice
      liquidity = amt1 / (sqrt(upper) - sqrt(lower))
   */
    calL(p: number, x: number, y: number) {
        p = Math.sqrt(p);
        var l = 0;
        if (p <= this.pa) {
            l = this.calLx(this.pa, x, true);
        } else if (p >= this.pb) {
            l = this.calLy(this.pb, y, true);
        } else {
            l = Math.min(this.calLx(p, x, true), this.calLy(p, y, true))
        }
        return l;
    }
    /**
    * calculate Lx
    */
    calLx(p: number, x: number, isSqrt = false) {
        if (!isSqrt) p = Math.sqrt(p);
        return x * (p * this.pb) / (this.pb - p);
    }
    /**
     * calculate Ly
     */
    calLy(p: number, y: number, isSqrt = false) {
        if (!isSqrt) p = Math.sqrt(p);
        return y / (p - this.pa);
    }

    /**
     * 当前价格p，提供的tokenY的数量y，算出应提供多少数量的x
     */
    calX(p: number) {
        p = Math.sqrt(p);
        if (p >= this.pb) return 0;
        return this.L * (this.pb - p) / (p * this.pb);
    }

    /**
     * 当前价格p，提供的tokenX的数量x，算出应提供多少数量的y
     */
    calY(p: number) {
        p = Math.sqrt(p);
        if (p <= this.pa) return 0;
        return this.L * (p - this.pa);
    }

    /**
     * 当前价格p，提供的tokenX的数量x，算出应提供多少数量的y
     */
    calY2X(p: number, x: number) {
        p = Math.sqrt(p);
        if (p <= this.pa) return 0;
        return this.calLx(p, x, true) * (p - this.pa);
    }

    /**
     * 当前价格p，提供的tokenY的数量y，算出应提供多少数量的x
     */
    calX2Y(p: number, y: number) {
        p = Math.sqrt(p);
        if (p >= this.pb) return 0;
        return this.calLy(p, y, true) * (this.pb - p) / (p * this.pb);
    }
}




function test() {
    var pool = new Pool(1972.4, 7800.6, 3858.14, 53.24, 197300)

    var price = 3866.07
    var x = 53.06
    var y = 198000;

    var price = 4072.82

    console.log("x: " + pool.calX(price), "y: " + pool.calY(price));
    console.log("x: " + pool.calX(1972), "y: " + pool.calY(7801));

    console.log(pool.calX2Y(3866.07, 198000), pool.calY2X(3866.07, 53.06))
}


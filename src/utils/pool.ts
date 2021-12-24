

/**
 * http://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
 */

export class Pool {
    Pl: number
    Pu: number
    liquidity: number
    constructor(Pl: number, Pu: number, P: number, amt0: number, amt1: number) {
        this.Pl = Math.sqrt(Pl);
        this.Pu = Math.sqrt(Pu);
        this.liquidity = this.calL(P, amt0, amt1);
        console.log("liquidity: " + this.liquidity);
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
    calL(p: number, amt0: number, amt1: number) {
        p = Math.sqrt(p);
        var l = 0;
        if (p <= this.Pl) {
            l = this.calLx(this.Pl, amt0, true);
        } else if (p >= this.Pu) {
            l = this.calLy(this.Pu, amt1, true);
        } else {
            l = Math.min(this.calLx(p, amt0, true), this.calLy(p, amt1, true))
        }
        return l;
    }
    /**
    * calculate Lx
    */
    calLx(p: number, amt0: number, isSqrt = false) {
        if (!isSqrt) p = Math.sqrt(p);
        return amt0 * (p * this.Pu) / (this.Pu - p);
    }
    /**
     * calculate Ly
     */
    calLy(p: number, amt1: number, isSqrt = false) {
        if (!isSqrt) p = Math.sqrt(p);
        return amt1 / (p - this.Pl);
    }

    /**
     * 当前价格p，提供的tokenY的数量y，算出应提供多少数量的x
     */
    calX(p: number) {
        p = Math.sqrt(p);
        if (p >= this.Pu) return 0;
        return this.liquidity * (this.Pu - p) / (p * this.Pu);
    }

    /**
     * 当前价格p，提供的tokenX的数量x，算出应提供多少数量的y
     */
    calY(p: number) {
        p = Math.sqrt(p);
        if (p <= this.Pl) return 0;
        return this.liquidity * (p - this.Pl);
    }

    /**
     * 当前价格p，提供的tokenX的数量x，算出应提供多少数量的y
     */
    calY2X(p: number, amt0: number) {
        p = Math.sqrt(p);
        if (p <= this.Pl) return 0;
        return this.calLx(p, amt0, true) * (p - this.Pl);
    }

    /**
     * 当前价格p，提供的tokenY的数量y，算出应提供多少数量的x
     */
    calX2Y(p: number, amt1: number) {
        p = Math.sqrt(p);
        if (p >= this.Pu) return 0;
        return this.calLy(p, amt1, true) * (this.Pu - p) / (p * this.Pu);
    }
}




function test() {
    var pool = new Pool(1972.4, 7800.6, 3858.14, 53.24, 197300)

    var price = 3866.07
    var x = 53.06
    var y = 198000;

    var price = 4072.82

    console.log("amt0: " + pool.calX(price), "amt1: " + pool.calY(price));
    console.log("amt0: " + pool.calX(1972), "amt1: " + pool.calY(7801));

    console.log(pool.calX2Y(3866.07, 198000), pool.calY2X(3866.07, 53.06))
}


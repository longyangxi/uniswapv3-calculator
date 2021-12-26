/**
 * http://atiselsts.github.io/pdfs/uniswap-v3-liquidity-math.pdf
 */

export class Pool {
    /**
     * Min price
     */
    Pl: number
    /**
     * Max price
     */
    Pu: number
    /***
     * Liquidity of the pool
     */
    liquidity0: number
    P0: number

    totalUSD0: number

    constructor(Pl: number, Pu: number) {
        this.Pl = Pl;
        this.Pu = Pu;
        this.liquidity0 = 0;
        this.totalUSD0 = 0;
        this.P0 = 0;
    }
    ifSameRange(pl: number, pu: number) {
        return this.Pl === pl && this.Pu === pu;
    }
    setInitData(P: number, amount0: number, amount1: number) {
        this.P0 = P;
        this.liquidity0 = this.calL(P, amount0, amount1);
    }
    calAmounts(P: number) {
        // eslint-disable-next-line eqeqeq
        if (this.liquidity0 == 0) {
            // eslint-disable-next-line no-throw-literal
            throw "Please setInitData firstly!"
        }
        P = Math.sqrt(P);
        var pl = Math.sqrt(this.Pl)
        var pu = Math.sqrt(this.Pu)
        var amount = { amount0: 0, amount1: 0 }
        if (P < pu) {
            if (P < pl) P = pl;
            amount.amount0 = this.liquidity0 * (pu - P) / (P * pu);
        }
        if (P > pl) {
            if (P > pu) P = pu;
            amount.amount1 = this.liquidity0 * (P - pl);
        }
        return amount;
    }
    calAmountsWithTotalUSD(P: number, totalUSD: number, priceUSD0: number, priceUSD1: number) {
        var x2y: number = this.getAmount0ByAmount1(P, 1);
        var y2x: number = this.getAmount1ByAmount0(P, 1);
        var amount: any = { amount0: 0, amount1: 0 };
        if (x2y === -1) {
            amount.amount0 = totalUSD / priceUSD0;
        } else if (y2x === -1) {
            amount.amount1 = totalUSD / priceUSD1;
        } else {
            amount.amount0 = totalUSD / (priceUSD0 + y2x * priceUSD1);
            amount.amount1 = totalUSD / (priceUSD1 + x2y * priceUSD0);
        }
        this.totalUSD0 = totalUSD;
        return amount;
    }
    /**
   * calculate Liquidity
   * The liquidity amount is calculated from the following numbers that describe a position:
   * amount of token 0 (amount0), amount of token 1 (amount1), price (as x token 1's per token 0) at the upper limit of the position (upper),
   * price at the lower limit of the position (lower) and the current swap price (cprice). Then liquidity for a position is calculated as follows:
  
      Case 1: cprice <= lower
      liquidity = amount0 * (sqrt(upper) * sqrt(lower)) / (sqrt(upper) - sqrt(lower))
  
      Case 2: lower < cprice <= upper
      liquidity is the min of the following two calculations:
      amount0 * (sqrt(upper) * sqrt(cprice)) / (sqrt(upper) - sqrt(cprice))
      amount1 / (sqrt(cprice) - sqrt(lower))
  
      Case 3: upper < cprice
      liquidity = amount1 / (sqrt(upper) - sqrt(lower))
   */
    calL(p: number, amount0: number, amount1: number) {
        p = Math.sqrt(p);
        var pl = Math.sqrt(this.Pl)
        var pu = Math.sqrt(this.Pu)
        var l = 0;
        if (p <= pl) {
            l = this.calLx(pl, amount0, true);
        } else if (p >= pu) {
            l = this.calLy(pu, amount1, true);
        } else {
            l = Math.min(this.calLx(p, amount0, true), this.calLy(p, amount1, true))
        }
        return l;
    }
    /**
    * calculate Lx
    */
    calLx(p: number, amount0: number, isSqrt = false) {
        if (!isSqrt) p = Math.sqrt(p);
        return amount0 * (p * Math.sqrt(this.Pu)) / (Math.sqrt(this.Pu) - p);
    }
    /**
     * calculate Ly
     */
    calLy(p: number, amount1: number, isSqrt = false) {
        if (!isSqrt) p = Math.sqrt(p);
        return amount1 / (p - Math.sqrt(this.Pl));
    }
    /**
     * 当前价格p，提供的tokenY的数量y，算出应提供多少数量的x
     */
    getAmount0ByAmount1(p: number, amount1: number) {
        p = Math.sqrt(p);
        var pl = Math.sqrt(this.Pl)
        var pu = Math.sqrt(this.Pu)
        if (p >= pu) return 0;
        if (p <= pl) return -1;
        return this.calLy(p, amount1, true) * (pu - p) / (p * pu);
    }

    /**
     * 当前价格p，提供的tokenX的数量x，算出应提供多少数量的y
     */
    getAmount1ByAmount0(p: number, amount0: number) {
        p = Math.sqrt(p);
        var pl = Math.sqrt(this.Pl)
        var pu = Math.sqrt(this.Pu)
        if (p >= pu) return -1;
        if (p <= pl) return 0;
        return this.calLx(p, amount0, true) * (p - pl);
    }
}




function test() {
    var pool = new Pool(1972.4, 7800.6)
    pool.setInitData(3858.14, 53.24, 197300)

    var price = 3866.07
    var x = 53.06
    var y = 198000;

    var price = 4072.82

    console.log(pool.calAmounts(price));
    console.log(pool.calAmounts(1972));
    console.log(pool.calAmounts(7801));
    console.log(pool.getAmount0ByAmount1(3866.07, 198000), pool.getAmount1ByAmount0(3866.07, 53.06))
}


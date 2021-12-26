import { useState } from "react";
import styled from "styled-components";
import { Heading } from "../../common/atomic";
import Table from "../../common/Table";
import { useAppContext } from "../../context/app/appContext";
import { AppActionType } from "../../context/app/appReducer";
import { getTokenAmountsFromDepositAmounts } from "../../utils/liquidityMath";
import { Pool } from "../../utils/pool";

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 6px 8px;

  & > span {
    color: white;
    font-size: 2rem;
    margin-right: 5px;
    font-family: sans-serif;
    font-weight: bold;
    transform: translateY(-1.5px);
  }
`;
const Input = styled.input`
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: white;

  &:focus {
    outline: none;
  }
`;
const DepositInput = styled.input`
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 2rem;

  &:focus {
    outline: none;
  }
`;

const Token = styled.div`
  display: flex;
  align-items: center;

  & > img {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    transform: translateX(-5px);
  }
`;

let pool: Pool;

const DepositAmounts = () => {
  const { state, dispatch } = useAppContext();

  const P = state.priceAssumptionValue;
  const Pl = state.priceRangeValue[0];
  const Pu = state.priceRangeValue[1];

  //todo
  const priceUSDX = P;//state.token1PriceChart?.currentPriceUSD || 1;
  //todo
  const priceUSDY = 1;//state.token0PriceChart?.currentPriceUSD || 1;

  const targetAmounts = state.depositAmountValue;

  // const { amount0, amount1 } = getTokenAmountsFromDepositAmounts(
  //   P,
  //   Pl,
  //   Pu,
  //   priceUSDX,
  //   priceUSDY,
  //   targetAmounts
  // );  

  if(P > 0 && Pl > 0 && Pu > 0)  {
    if(pool == null || !pool.ifSameRange(Pl, Pu)) {
      pool = new Pool(Pl, Pu);
      }
      if(pool.totalUSD0 !== targetAmounts) {
        var amounts = pool.calAmountsWithTotalUSD(P, targetAmounts, priceUSDX, priceUSDY)
        pool.setInitData(P, amounts.amount0, amounts.amount1);
        state.amounts = [amounts.amount0, amounts.amount1]
      }
      if(P !== pool.P0) {
        amounts = pool.calAmounts(P)
        state.amounts = [amounts.amount0, amounts.amount1]
      }
  }
  
  return (
    <div>
      <Heading>Deposit Amounts</Heading>
      <InputGroup>
        <span className="dollar">$</span>
        <DepositInput
          value={state.depositAmountValue}
          type="number"
          placeholder="0.00"
          onChange={(e) => {
            let value = Number(e.target.value);
            if (value < 0) value = 0;

            // pool = new Pool(Pl, Pu);
            // var amounts = pool.calAmountsWithTotalUSD(P, value, priceUSDX, priceUSDY)
            // pool.setInitData(P, amounts.amount0, amounts.amount1);
            // dispatch({
            //   type: AppActionType.UPDATE_AMOUNTS,
            //   payload: [amounts.amount0, amounts.amount1],
            // });

            dispatch({
              type: AppActionType.UPDATE_DEPOSIT_AMOUNT,
              payload:  value
            })
          }}
        />
      </InputGroup>

      <Table>
        <Token>
          <img alt={state.token0?.name} src={state.token0?.logoURI} />{" "}
          <span>{state.token0?.symbol}</span>
        </Token>
        {/* <div>{amount1.toFixed(5)}</div> */}
        <Input
          value={state.amounts[1]}
          type="number"
          placeholder="0.0"
          onChange={(e) => {
            let value = Number(e.target.value);
            let amount0 = pool.getAmount0ByAmount1(P, value);
            let totalUsd = amount0 * priceUSDX + value * priceUSDY 

            // pool.setInitData(P, amount0, value);
            dispatch({
              type: AppActionType.UPDATE_AMOUNTS,
              payload: [amount0, value],
            });

            dispatch({
              type: AppActionType.UPDATE_DEPOSIT_AMOUNT,
              payload:  totalUsd
            })
            
          }}
        />
        <div>${(state.amounts[1] * priceUSDY).toFixed(2)}</div>
      </Table>
      <Table>
        <Token>
          <img alt={state.token1?.name} src={state.token1?.logoURI} />{" "}
          <span>{state.token1?.symbol}</span>
        </Token>
        {/* <div>{amount0.toFixed(5)}</div> */}
        <Input
          value={state.amounts[0]}
          type="number"
          placeholder="0.0"
          onChange={(e) => {
            let value = Number(e.target.value);
            let amount1 = pool.getAmount1ByAmount0(P, value);
            let totalUsd = value * priceUSDX + amount1 * priceUSDY 

            // pool.setInitData(P, value, amount1);
            dispatch({
              type: AppActionType.UPDATE_AMOUNTS,
              payload: [value, amount1],
            });

            dispatch({
              type: AppActionType.UPDATE_DEPOSIT_AMOUNT,
              payload:  totalUsd
            })
          }}
        />
        <div>${(state.amounts[0] * priceUSDX).toFixed(2)}</div>
      </Table>
    </div>
  );
};

export default DepositAmounts;

import React, { useEffect } from "react";
import Modal from "react-modal";
import ReactLoading from "react-loading";
import { useModalContext } from "../../context/modal/modalContext";
import { Heading } from "../../common/atomic";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { PrimaryBlockButton, PrimaryButton } from "../../common/buttons";
import { useState } from "react";
import {
  getPoolFromPair,
  getPoolTicks,
  getTokenList,
  getVolumn24H,
  Pool,
  V3Token,
} from "../../repos/uniswap";
import SearchTokenPage from "./SearchTokenPage";
import { useAppContext } from "../../context/app/appContext";
import { AppActionType } from "../../context/app/appReducer";
import { sortToken } from "../../utils/helper";
import { getPriceChart } from "../../repos/coingecko";
import {
  ModalActionType,
  modalContextReducer,
} from "../../context/modal/modalReducer";
import { getPositionInfo } from "../../utils/position";
import { Pool as PPool } from "../../utils/pool";
import { getPriceFromTick } from "../../utils/liquidityMath";


const ModalStyle = {
  overlay: {
    backgroundColor: "rgba(0,0,0,0.9)",
    zIndex: 99999,
  },
  content: {
    border: 0,
    padding: 0,
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    borderRadius: "16px",
    marginRight: "calc(-50% + 30px)",
    transform: "translate(-50%, -50%)",
    background: "rgb(28, 27, 28)",
  },
};
const Container = styled.div`
  width: 400px;
  padding: 15px;
`;
const SelectPairContainer = styled.div`
  display: grid;
  grid-gap: 10px;
  margin-bottom: 15px;
  grid-template-columns: repeat(2, 1fr);
`;
const TokenSelect = styled.div`
  color: white;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  & > span {
    display: flex;
    align-items: center;

    & > img {
      width: 25px;
      height: 25px;
      margin-right: 10px;
      border-radius: 50%;
    }
  }
`;
const Tier = styled.div`
  border-radius: 12px;
  padding: 6px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);

  & h4 {
    color: #fff;
    margin: 0;
    font-size: 1rem;
  }

  & > span {
    font-size: 0.8rem;
    line-height: 1.2rem;
    margin-top: 5px;
    display: inline-block;
    color: #999;
  }

  & > div {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 3px 5px;
    color: #ccc;
    font-size: 0.8rem;
    margin-top: 7px;
    text-align: center;
  }
`;
const FeeTiersContainer = styled.div`
  display: grid;
  grid-gap: 7px;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
`;
const GoBack = styled.h1`
  color: white;
  margin: 0;
  font-weight: 500;
  display: flex;
  padding: 15px;
  justify-content: center;
  align-items: center;
  background: rgb(50, 50, 50);
  font-size: 1rem;

  & > div {
    cursor: pointer;
    position: absolute;
    left: 15px;
  }
`;
const Logo = styled.h1`
  color: white;
  margin: 0;
  font-weight: bold;
  font-size: 1.2rem;
  color: #ddd;
  font-weight: 500;
  display: flex;
  padding: 15px;
  align-items: center;
  background: rgb(50, 50, 50);
  & > span {
    font-size: 1.4rem;
    margin-right: 7px;
  }
`;
const IdInput = styled.input`
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: white;
  font-weight: 600;
  font-size: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 6px 8px;

  &:focus {
    outline: none;
  }
`;
const SplitLine = styled.div`
  display: block;
  width: 100%;
  border:none;
  border-top:2px solid rgba(255, 255, 255, 0.2);
  margin-top: 10px;
  margin-bottom: 10px;
`

const FEE_TIER_STYLES = {
  DISABLE: {
    cursor: "not-allowed",
    background: "rgba(255, 255, 255, 0.1)",
  },
  ACTIVE: {
    border: "1px solid rgba(38, 109, 221, 1)",
    background: "rgba(38, 109, 221, 0.25)",
  },
};

const SelectPairModal = () => {
  const appContext = useAppContext();
  const modalContext = useModalContext();

  const [selectedTokens, setSelectedTokens] = useState<V3Token[] | null[]>([
    null,
    null,
  ]);
  const [showSelectTokenPage, setShowSelectTokenPage] =
    useState<boolean>(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null
  );

  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);

  const [curPosition, setCurPosition] = useState<any>(null)

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    fetchPools();
  }, [selectedTokens]);

  useEffect(() => {
    updatePosition()
  }, [curPosition, appContext.state.tokenList])

  useEffect(() => {
    updatePosition1()
  }, [selectedTokens, pools])

  const isCheckDisabled = isSubmitLoading || appContext.state.positionID <= 0;

  const checkPosition = async() => {
    setIsSubmitLoading(true)
    let position = await getPositionInfo(appContext.state.positionID)
    setCurPosition(position);
    setIsSubmitLoading(false);
  }  

  const isFormDisabled =
    isSubmitLoading ||
    !(selectedTokens[0] && selectedTokens[1] && selectedPool);

  const handleSubmit = async () => {
    if (
      isSubmitLoading ||
      !(selectedTokens[0] && selectedTokens[1] && selectedPool)
    ) {
      return;
    }
    setIsSubmitLoading(true);

    const [token0, token1] = sortToken(selectedTokens[0], selectedTokens[1]);
    const pool = selectedPool;
    const poolTicks = await getPoolTicks(pool.id);
    const token0PriceChart = await getPriceChart(token0.id);
    const token1PriceChart = await getPriceChart(token1.id);
    const volume24H = await getVolumn24H(pool.id);

    appContext.dispatch({
      type: AppActionType.RESET_PAIR,
      payload: {
        pool,
        poolTicks,
        token0,
        token1,
        token0PriceChart,
        token1PriceChart,
        volume24H,
      },
    });

    setIsSubmitLoading(false);
    modalContext.dispatch({
      type: ModalActionType.SET_SELECT_PAIR_MODAL_STATE,
      payload: false,
    });
  };

  const updatePosition = () => {
    if(!curPosition || !appContext.state.tokenList.length) return;

    const token0 = getTokenByAddress(curPosition.token0)
    const token1 = getTokenByAddress(curPosition.token1)
  
    if(token0 == null) return;
    if(token1 == null) return;

    setSelectedTokens([token0, token1]);
  }

  const updatePosition1 = () => {
    if(!curPosition || !pools.length) return;
    const fee = curPosition.fee?.toString()
    const tier = getFeeTier(fee);
    tier && setSelectedPool(tier);


    const decimals0 = selectedTokens[0]?.decimals || "18"
    const decimals1 = selectedTokens[1]?.decimals || "18"

    let priceLower = Number(getPriceFromTick(curPosition?.tickLower, decimals0, decimals1).toFixed(5))
    let priceUpper = Number(getPriceFromTick(curPosition?.tickUpper, decimals0, decimals1).toFixed(5))

    appContext.dispatch({
      type: AppActionType.UPDATE_PRICE_RANGE,
      payload: [priceUpper, priceLower],
    });

    appContext.dispatch({
      type: AppActionType.UPDATE_LIQUIDITY,
      payload: curPosition.liquidity / 10**12
    })
  }
  const fetchPools = async () => {
    if (!selectedTokens[0] || !selectedTokens[1]) return;
    const pools = await getPoolFromPair(selectedTokens[0], selectedTokens[1]);
    setPools(pools);
    if (pools.length === 0) {
      setSelectedPool(null);
      return;
    }

      let maxPool = pools[0];
      let maxLiquidity = Number(pools[0].liquidity);
      pools.forEach((pool) => {
        if (Number(pool.liquidity) > maxLiquidity) {
          maxPool = pool;
          maxLiquidity = Number(pool.liquidity);
        }
      });
      setSelectedPool(maxPool);
  };

  const getFeeTier = (feeTier: string) => {
    return pools.find((pool) => pool.feeTier === feeTier) || null;
  };

  const getFeeTierPercentage = (feeTier: string) => {
    const tier = getFeeTier(feeTier);
    if (tier === null) {
      return "Not Available";
    }
    const totalLiquidity = pools.reduce(
      (result, curr) => result + Number(curr.liquidity),
      0
    );
    return `${Math.round(
      (100 * Number(tier.liquidity)) / totalLiquidity
    )}% select`;
  };

  const getFeeTierStyle = (feeTier: string) => {
    if (selectedPool?.feeTier === feeTier) {
      return FEE_TIER_STYLES.ACTIVE;
    }

    if (getFeeTier(feeTier) === null) {
      return FEE_TIER_STYLES.DISABLE;
    }

    return {};
  };

  const fetchTokens = async () => {
    const tokenList = await getTokenList();
    appContext.dispatch({
      type: AppActionType.RESET_TOKEN_LIST,
      payload: { tokenList },
    });
  };

  const getTokenByAddress = (addr: string) => {
     const list = appContext.state.tokenList
     for(var i = 0; i < list.length; i++) {
       if(list[i].id.toLowerCase() === addr.toLowerCase()) {
         return list[i]
       }
     }
     return null;
  }

  const selectToken = (token: V3Token) => {
    const _selectedTokens = JSON.parse(JSON.stringify(selectedTokens));

    if (selectedTokenIndex !== null) {
      _selectedTokens[selectedTokenIndex] = token;
    }

    setSelectedTokens(_selectedTokens);
    setSelectedTokenIndex(null);
    setShowSelectTokenPage(false);
  };

  return (
    <>
      <Modal
        ariaHideApp={false}
        style={ModalStyle}
        isOpen={modalContext.state.isSelectPairModalOpen}
        contentLabel="Example Modal"
      >
        {showSelectTokenPage && (
          <>
            <GoBack>
              <div
                onClick={() => {
                  setShowSelectTokenPage(false);
                  setSelectedTokenIndex(null);
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </div>
              <span>Select Token</span>
            </GoBack>
            <SearchTokenPage
              selectToken={selectToken}
              tokens={appContext.state.tokenList}
            />
          </>
        )}
        {!showSelectTokenPage && (
          <>
            <Logo>
              <span>🦄</span> UniswapCalculator
            </Logo>
            <Container>
              <Heading>Do you have a position ID?</Heading>
              <SelectPairContainer>
              <IdInput
                value={appContext.state.positionID}
                type="number"
                placeholder="0"
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (value < 0) value = 0;
                  appContext.dispatch({
                    type: AppActionType.UPDATE_POSITION,
                    payload: value
                  })
                }}
              />
              <PrimaryButton onClick={checkPosition}
                disabled={isCheckDisabled}
                style={
                  isCheckDisabled
                    ? {
                        background: "rgba(255, 255, 255, 0.1)",
                        cursor: "not-allowed",
                      }
                    : {}
                }
              >
                {isSubmitLoading && (
                  <ReactLoading
                    type="spin"
                    color="rgba(34, 114, 229, 1)"
                    height={18}
                    width={18}
                  />
                )}
                {!isSubmitLoading && <span>Check</span>}</PrimaryButton>
              </SelectPairContainer>
              <SplitLine/>
              <Heading>Select Pair</Heading>
              <SelectPairContainer>
                <TokenSelect
                  onClick={() => {
                    if (!isSubmitLoading) {
                      setSelectedPool(null);
                      setShowSelectTokenPage(true);
                      setSelectedTokenIndex(0);
                    }
                  }}
                >
                  {!selectedTokens[0] && <span>Select a token</span>}
                  {selectedTokens[0] && (
                    <span>
                      <img
                        src={selectedTokens[0].logoURI}
                        alt={selectedTokens[0].name}
                      />
                      {selectedTokens[0].symbol}
                    </span>
                  )}
                  <span>
                    <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>
                  </span>
                </TokenSelect>
                <TokenSelect
                  onClick={() => {
                    if (!isSubmitLoading) {
                      setSelectedPool(null);
                      setShowSelectTokenPage(true);
                      setSelectedTokenIndex(1);
                    }
                  }}
                >
                  {!selectedTokens[1] && <span>Select a token</span>}
                  {selectedTokens[1] && (
                    <span>
                      <img
                        src={selectedTokens[1].logoURI}
                        alt={selectedTokens[1].name}
                      />
                      {selectedTokens[1].symbol}
                    </span>
                  )}
                  <span>
                    <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>
                  </span>
                </TokenSelect>
              </SelectPairContainer>

              <Heading>Select Fee Tier</Heading>
              <FeeTiersContainer>
                <Tier
                  style={getFeeTierStyle("500")}
                  onClick={() => {
                    if (!isSubmitLoading) {
                      const tier = getFeeTier("500");
                      tier && setSelectedPool(tier);
                    }
                  }}
                >
                  <h4 style={!getFeeTier("500") ? { color: "#999" } : {}}>
                    0.05% fee
                  </h4>
                  <span>Best for stable pairs.</span>
                  <div>{getFeeTierPercentage("500")}</div>
                </Tier>
                <Tier
                  style={getFeeTierStyle("3000")}
                  onClick={() => {
                    if (!isSubmitLoading) {
                      const tier = getFeeTier("3000");
                      tier && setSelectedPool(tier);
                    }
                  }}
                >
                  <h4 style={!getFeeTier("3000") ? { color: "#999" } : {}}>
                    0.3% fee
                  </h4>
                  <span>Best for most pairs.</span>
                  <div>{getFeeTierPercentage("3000")}</div>
                </Tier>
                <Tier
                  style={getFeeTierStyle("10000")}
                  onClick={() => {
                    if (!isSubmitLoading) {
                      const tier = getFeeTier("10000");
                      tier && setSelectedPool(tier);
                    }
                  }}
                >
                  <h4 style={!getFeeTier("10000") ? { color: "#999" } : {}}>
                    1% fee
                  </h4>
                  <span>Best for exotic pairs.</span>
                  <div>{getFeeTierPercentage("10000")}</div>
                </Tier>
              </FeeTiersContainer>

              <PrimaryBlockButton
                onClick={handleSubmit}
                disabled={isFormDisabled}
                style={
                  isFormDisabled
                    ? {
                        background: "rgba(255, 255, 255, 0.1)",
                        cursor: "not-allowed",
                      }
                    : {}
                }
              >
                {isSubmitLoading && (
                  <ReactLoading
                    type="spin"
                    color="rgba(34, 114, 229, 1)"
                    height={18}
                    width={18}
                  />
                )}
                {!isSubmitLoading && <span>Calculate</span>}
              </PrimaryBlockButton>
            </Container>
          </>
        )}
      </Modal>
    </>
  );
};

export default SelectPairModal;

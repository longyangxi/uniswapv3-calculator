import { ethers } from 'ethers'
import positionAbi from '../abi/NonfungiblePositionManager.json'
import { getPriceFromTick  } from "../utils/liquidityMath"
import { Pool } from './pool'

const DEFAULT_ERC20_ABI = [
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "function transfer(address _to, uint256 _value) public returns (bool success)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
    "function allowance(address owner, address spender) public view returns (uint256 allownce)",
    "function approve(address spender, uint256 amount) public returns (bool success)"
  ]
const FACTORY_ABI = [
    "function getPool( address tokenA, address tokenB, uint24 fee ) external view returns (address pool)"
]  

const POSITION_CONTRACT_ADDRESS = '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
const FACTORY_CONTRACT_ADDRESS = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

const provider =  ethers.getDefaultProvider();
const positionContract = new ethers.Contract(POSITION_CONTRACT_ADDRESS, positionAbi, provider);
const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider);

export const getPositionInfo = async function(tokenId: number) {
    let owner = await positionContract.ownerOf(tokenId)
    let info = await positionContract.positions(tokenId)
    let more = await factoryContract.getPool(info.token0, info.token1, info.fee)
    let data = {
        owner: owner,
        address: more.toString(),
        liquidity: parseInt(info.liquidity.toString()),
        token0: info.token0,
        token1: info.token1,
        fee: info.fee,
        tickLower: info.tickLower,
        tickUpper: info.tickUpper,
        priceLower: 0,
        priceUpper: 0
    }

    // let tokenContract0 =  new ethers.Contract(info.token0, DEFAULT_ERC20_ABI, provider)
    // let decimals0 = await tokenContract0.decimals()
    // let tokenContract1 =  new ethers.Contract(info.token1, DEFAULT_ERC20_ABI, provider)
    // let decimals1 = await tokenContract1.decimals()
    // data.priceLower = Number(getPriceFromTick(info.tickLower, decimals0, decimals1).toFixed(5))
    // data.priceUpper = Number(getPriceFromTick(info.tickUpper, decimals0, decimals1).toFixed(5))

    // console.log(data)
    return data;
}
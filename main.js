const ethers = require("ethers");
const Scalar = require("ffjavascript").Scalar;

const uniswapLib = require("./uniswap-lib");

// pools uniswap: https://v2.info.uniswap.org/pairs

async function main(){
    // load config.json
    const nodeUrl = require("./config.json").ethNodeUrl;

    // load abi uniswap pair & pair addresses & erc20 abi
    const pairsInfo = require("./config-uniswap/config-uniswap-pairs.json");
    const abiUniswapPair = require("./config-uniswap/abi-uniswap-pair.json").abi;
    const abiERC20 = require("./config-uniswap/abi-erc20.json").abi;

    // load params
    const provider = new ethers.providers.JsonRpcProvider(nodeUrl);

    for (let i = 0; i < pairsInfo.length; i++){
        const pairInfo = pairsInfo[i];

        // load contract pair uniswap
        const uniswapPair = new ethers.Contract(pairInfo.pairAddress, abiUniswapPair, provider);

        // get pair tokens and its info associated
        const addressToken0 = await uniswapPair.token0();
        const addressToken1 = await uniswapPair.token1();

        const reservesInfo = await uniswapPair.getReserves();
        const reserve0 = Scalar.e(reservesInfo.reserve0);
        const reserve1 = Scalar.e(reservesInfo.reserve1);

        // get info tokens
        const token0 = new ethers.Contract(addressToken0, abiERC20, provider);
        const token1 = new ethers.Contract(addressToken1, abiERC20, provider);

        const token0Decimals = await token0.decimals();
        const token1Decimals = await token1.decimals();

        const token0Symbol = await token0.symbol();
        const token1Symbol = await token1.symbol();

        // sort tokens & compute price
        if (pairInfo.mainReserveSymbol !== token0Symbol && pairInfo.mainReserveSymbol !== token1Symbol)
            throw Error(`${pairInfo.mainReserveSymbol} has not been found in uniswap pair ${pairInfo.pairAddress}`);

        let tokenADecimals;
        let tokenBDecimals;

        let tokenAReserve;
        let tokenBReserve;

        let tokenASymbol;
        let tokenBSymbol;

        if (pairInfo.mainReserveSymbol === token1Symbol){
            tokenADecimals = token0Decimals;
            tokenBDecimals = token1Decimals;
            tokenAReserve = reserve0;
            tokenBReserve = reserve1;
            tokenASymbol = token0Symbol;
            tokenBSymbol = token1Symbol;
        } else {
            tokenADecimals = token1Decimals;
            tokenBDecimals = token0Decimals;
            tokenAReserve = reserve1;
            tokenBReserve = reserve0;
            tokenASymbol = token1Symbol;
            tokenBSymbol = token0Symbol;
        }

        const amountIn = Scalar.pow(10, tokenADecimals);
        const amountOut = uniswapLib.getAmountOut(amountIn, tokenAReserve, tokenBReserve);

        // compute price
        const finalAmountIn = Number(amountIn) / 10**tokenADecimals;
        const finalAmountOut = Number(amountOut) / 10**tokenBDecimals;

        const price = finalAmountIn / finalAmountOut;
        console.log(`price ${tokenBSymbol}: ${price.toFixed(2)} ${tokenASymbol}`);
    }
}

main();
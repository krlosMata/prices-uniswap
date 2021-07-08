const Scalar = require("ffjavascript").Scalar;

// uniswap library could be found in solidity in:
// https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol#L43

// implement uniswap library in JS

function getAmountOut(amountIn, reserveIn, reserveOut){
    if (amountIn <= 0)
        throw new Error("UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT");

    if (reserveIn <= 0 && reserveOut <= 0)
        throw new Error('UniswapV2Library: INSUFFICIENT_LIQUIDITY');

    const amountInWithFee = Scalar.mul(amountIn, 997);
    const numerator = Scalar.mul(amountInWithFee, reserveOut);
    const denominator = Scalar.add(Scalar.mul(reserveIn, 1000), amountInWithFee);
    return Scalar.div(numerator, denominator);
}


module.exports = {
    getAmountOut
};
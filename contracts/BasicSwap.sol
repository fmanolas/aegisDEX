// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract BasicSwap {

    // Token addresses
    address public tokenA;
    address public tokenB;
    
    // Liquidity pools
    uint256 public liquidityA;
    uint256 public liquidityB;

    // Event to log swaps
    event Swap(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    // Event to log liquidity provision
    event LiquidityProvided(address indexed provider, uint256 amountA, uint256 amountB);

    // Event to log liquidity removal
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);

    constructor(address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    // Swap function
    function swap(address tokenIn, uint256 amountIn) public {
        require(tokenIn == tokenA || tokenIn == tokenB, "Invalid token");
        require(amountIn > 0, "Amount must be greater than zero");

        address tokenOut = (tokenIn == tokenA) ? tokenB : tokenA;

        uint256 reserveIn = (tokenIn == tokenA) ? liquidityA : liquidityB;
        uint256 reserveOut = (tokenIn == tokenA) ? liquidityB : liquidityA;

        // Calculate the amount out with a simple constant product formula
        uint256 amountOut = getAmountOut(amountIn, reserveIn, reserveOut);

        // Update liquidity
        if (tokenIn == tokenA) {
            liquidityA += amountIn;
            liquidityB -= amountOut;
        } else {
            liquidityA -= amountOut;
            liquidityB += amountIn;
        }

        // Transfer tokens
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "Transfer failed");

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // Provide liquidity
    function provideLiquidity(uint256 amountA, uint256 amountB) public {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than zero");

        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "Transfer of token A failed");
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "Transfer of token B failed");

        liquidityA += amountA;
        liquidityB += amountB;

        emit LiquidityProvided(msg.sender, amountA, amountB);
    }

    // Remove liquidity
    function removeLiquidity(uint256 amountA, uint256 amountB) public {
        require(amountA > 0 && amountB > 0, "Amounts must be greater than zero");
        require(amountA <= liquidityA && amountB <= liquidityB, "Not enough liquidity");

        liquidityA -= amountA;
        liquidityB -= amountB;

        require(IERC20(tokenA).transfer(msg.sender, amountA), "Transfer of token A failed");
        require(IERC20(tokenB).transfer(msg.sender, amountB), "Transfer of token B failed");

        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    // Utility function to calculate the amount out based on constant product formula
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Amount in must be greater than zero");
        require(reserveIn > 0 && reserveOut > 0, "Reserves must be greater than zero");

        // Simple constant product formula
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }
}

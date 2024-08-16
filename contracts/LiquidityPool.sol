// SPDX-License-Identifier: OPEN
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

library SafeMath {
    function add(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x + y) >= x, "ds-math-add-overflow");
    }

    function sub(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x - y) <= x, "ds-math-sub-underflow");
    }

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    function div(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y > 0, "ds-math-div-zero");
        z = x / y;
    }
}

contract LiquidityPool is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public reserve1;
    uint256 public reserve2;
    IERC20 public token1;
    IERC20 public token2;
    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;

    event LiquidityAdded(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidity);
    event Swap(address indexed swapper, address indexed tokenIn, uint256 amountIn, address indexed tokenOut, uint256 amountOut);

    constructor(address _token1, address _token2) ERC20("Liquidity Provider Token", "LPT") Ownable(msg.sender) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    function getReserves() public view returns (uint256 _reserve1, uint256 _reserve2) {
        _reserve1 = reserve1;
        _reserve2 = reserve2;
    }

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) internal pure returns (uint256) {
        require(amountA > 0, "INSUFFICIENT_AMOUNT");
        require(reserveA > 0 && reserveB > 0, "INSUFFICIENT_LIQUIDITY");
        return amountA.mul(reserveB).div(reserveA);
    }

    function _addLiquidity(
        uint256 _token1Quantity,
        uint256 _token2Quantity
    ) internal view returns (uint256 amountA, uint256 amountB) {
        require(_token1Quantity != 0 && _token2Quantity != 0, "TOKEN_QUANTITY_ZERO");
        (uint256 reserveA, uint256 reserveB) = getReserves();
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (_token1Quantity, _token2Quantity);
        } else {
            uint256 amount2Optimal = quote(_token1Quantity, reserveA, reserveB);
            if (amount2Optimal <= _token2Quantity) {
                (amountA, amountB) = (_token1Quantity, amount2Optimal);
            } else {
                uint256 amountAOptimal = quote(_token2Quantity, reserveB, reserveA);
                assert(amountAOptimal <= _token1Quantity);
                (amountA, amountB) = (amountAOptimal, _token2Quantity);
            }
        }
    }

    function addLiquidity(
        uint256 amountToken1,
        uint256 amountToken2,
        address to
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        (amountA, amountB) = _addLiquidity(amountToken1, amountToken2);
        token1.safeTransferFrom(msg.sender, address(this), amountA);
        token2.safeTransferFrom(msg.sender, address(this), amountB);
        liquidity = _mintLPTokens(to);
        emit LiquidityAdded(to, amountA, amountB, liquidity);
    }

    function _mintLPTokens(address to) internal returns (uint256 liquidity) {
    (uint256 _reserve1, uint256 _reserve2) = getReserves();
    uint256 balance1 = token1.balanceOf(address(this));
    uint256 balance2 = token2.balanceOf(address(this));
    uint256 amount1 = balance1.sub(_reserve1);
    uint256 amount2 = balance2.sub(_reserve2);

    uint256 _totalLiquidity = totalSupply();
    if (_totalLiquidity == 0) {
        liquidity = Math.sqrt(amount1.mul(amount2)).sub(MINIMUM_LIQUIDITY);
        _mint(address(this), MINIMUM_LIQUIDITY); // Lock the first MINIMUM_LIQUIDITY tokens in the contract itself
    } else {
        liquidity = Math.min(
            amount1.mul(_totalLiquidity).div(_reserve1),
            amount2.mul(_totalLiquidity).div(_reserve2)
        );
    }
    require(liquidity > 0, "INSUFFICIENT_LIQUIDITY_MINTED");
    _mint(to, liquidity);
    reserve1 = balance1;
    reserve2 = balance2;
}

    function _burnLPTokens(address from) internal returns (uint256 amount1, uint256 amount2) {
        uint256 balance1 = token1.balanceOf(address(this));
        uint256 balance2 = token2.balanceOf(address(this));
        uint256 liquidity = balanceOf(from);

        uint256 _totalLiquidity = totalSupply();
        amount1 = liquidity.mul(balance1).div(_totalLiquidity);
        amount2 = liquidity.mul(balance2).div(_totalLiquidity); // using balances ensures pro-rata distribution
        require(amount1 > 0 && amount2 > 0, "INSUFFICIENT_LIQUIDITY_BURNED");
        _burn(from, liquidity);
    }

    function removeLiquidity(
        uint256 liquidity,
        address to
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(balanceOf(msg.sender) >= liquidity, "INSUFFICIENT_LIQUIDITY");
        (amountA, amountB) = _burnLPTokens(msg.sender);
        token1.safeTransfer(to, amountA);
        token2.safeTransfer(to, amountB);
        reserve1 = token1.balanceOf(address(this));
        reserve2 = token2.balanceOf(address(this));
        emit LiquidityRemoved(to, amountA, amountB, liquidity);
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        address to
    ) external nonReentrant {
        require(amountIn > 0, "INSUFFICIENT_INPUT_AMOUNT");
        (uint256 reserveIn, uint256 reserveOut) = tokenIn == address(token1) ? getReserves() : (reserve2, reserve1);
        require(reserveIn > 0 && reserveOut > 0, "INSUFFICIENT_LIQUIDITY");

        uint256 amountInWithFee = amountIn.mul(997); // 0.3% fee
        uint256 numerator = amountInWithFee.mul(reserveOut);
        uint256 denominator = reserveIn.mul(1000).add(amountInWithFee);
        uint256 amountOut = numerator.div(denominator);

        require(amountOut <= reserveOut, "INSUFFICIENT_LIQUIDITY");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn == address(token1) ? address(token2) : address(token1)).safeTransfer(to, amountOut);

        // Update reserves
        reserve1 = token1.balanceOf(address(this));
        reserve2 = token2.balanceOf(address(this));

        emit Swap(msg.sender, tokenIn, amountIn, tokenIn == address(token1) ? address(token2) : address(token1), amountOut);
    }
}

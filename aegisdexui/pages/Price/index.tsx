import qs from "qs";
import useSWR from "swr";
import { ConnectKitButton } from "connectkit";
import { useState, ChangeEvent, useEffect } from "react";
import { formatUnits, parseUnits } from "ethers";
import {
  erc20ABI,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
  useBalance,
  type Address,
} from "wagmi";
import { polygon } from "wagmi/chains";
import {
  POLYGON_TOKENS,
  POLYGON_TOKENS_BY_SYMBOL,
  POLYGON_TOKENS_BY_ADDRESS,
  MAX_ALLOWANCE,
  exchangeProxy,
} from "../../lib/constants";
import CustomSelect from "@/components/CustomSelect";
import { SelectChangeEvent } from "@mui/material";
import Image from "next/image";
import downArrow from "../../public/downArrow.svg";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchNetworkCoins } from "@/lib/network/networkSlice";
import { fetchUserBalances } from "@/lib/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

interface PriceRequestParams {
  sellToken: string;
  buyToken: string;
  buyAmount?: string;
  sellAmount?: string;
  takerAddress?: string;
}

const AFFILIATE_FEE = 0.01; // Percentage of the buyAmount that should be attributed to feeRecipient as affiliate fees
const FEE_RECIPIENT = `${process.env.WALLET_ADDRESS_FEE_RECIPIENT}`; // The ETH address that should receive affiliate fees

export const fetcher = ([endpoint, params]: [string, PriceRequestParams]) => {
  const { sellAmount, buyAmount } = params;
  if (!sellAmount && !buyAmount) return;
  const query = qs.stringify(params);

  return fetch(`${endpoint}?${query}`).then((res) => res.json());
};

export default function PriceView({
  price,
  setPrice,
  setFinalize,
  takerAddress,
}: {
  price: any;
  setPrice: (price: any) => void;
  setFinalize: (finalize: boolean) => void;
  takerAddress: Address | undefined;
}) {
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [sellToken, setSellToken] = useState("wmatic");
  const [buyToken, setBuyToken] = useState("dai");
  const [activeForm, setActiveForm] = useState<"swap" | "send">("swap");
  const dispatch = useDispatch<AppDispatch>();
  const { balances } = useSelector((state: RootState) => state.user);
  const { coins } = useSelector((state: RootState) => state.network);
  useEffect(() => {
    if (takerAddress !== undefined) dispatch(fetchUserBalances(takerAddress));

    dispatch(fetchNetworkCoins("Ethereum"));
  }, [dispatch, takerAddress]);
  const handleSwapClick = () => {
    setActiveForm("swap");
  };

  const handleSendClick = () => {
    setActiveForm("send");
  };
  const handleSellTokenChange = (e: SelectChangeEvent<string>) => {
    setSellToken(e.target.value);
  };

  function handleBuyTokenChange(e: SelectChangeEvent<string>) {
    setBuyToken(e.target.value);
  }

  const sellTokenDecimals = balances[sellToken]?.decimals;

  console.log("sellAmount", sellAmount, "sellTokenDecimals", sellTokenDecimals);
  const parsedSellAmount =
    sellAmount && tradeDirection === "sell"
      ? parseUnits(sellAmount, sellTokenDecimals).toString()
      : undefined;

  const buyTokenDecimals = balances[buyToken]?.decimals;

  const parsedBuyAmount =
    buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenDecimals).toString()
      : undefined;

  // fetch price here
  const { isLoading: isLoadingPrice } = useSWR(
    [
      "/api/price",
      {
        sellToken: balances[sellToken]?.address,
        buyToken: coins[buyToken]?.address,
        sellAmount: parsedSellAmount,
        buyAmount: parsedBuyAmount,
        takerAddress,
        feeRecipient: FEE_RECIPIENT,
        buyTokenPercentageFee: AFFILIATE_FEE,
      },
    ],
    fetcher,
    {
      onSuccess: (data) => {
        setPrice(data);
        if (tradeDirection === "sell") {
          console.log(
            "formatted buyAmount",
            formatUnits(data.buyAmount, buyTokenDecimals),
            "data",
            data
          );
          setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals));
        } else {
          setSellAmount(formatUnits(data.sellAmount, sellTokenDecimals));
        }
      },
    }
  );

  // Conditionally set the token address
  const tokenAddress =
    sellToken.toLowerCase() === "matic"
      ? undefined
      : balances[sellToken]?.address;

  const { data, isError, isLoading } = useBalance({
    address: takerAddress,
    token: tokenAddress,
  });
  console.log("address", takerAddress, "token", balances[sellToken]?.address);

  console.log("sellAmount", sellAmount);

  const disabled =
    data && sellAmount
      ? parseUnits(sellAmount, sellTokenDecimals) > data.value
      : true;

  console.log("data", data, "isError", isError, "isLoading", isLoading);

  return (
    <div className="flex flex-col justify-center bg-transparent p-6 rounded-lg shadow-lg max-w-md ml-[30rem]">
      <div className="flex mb-4 justify-center">
        <button
          onClick={handleSwapClick}
          className={`${
            activeForm === "swap" ? "bg-[#545454]" : "bg-[#383838]"
          } text-white px-8 py-2 mr-4 rounded-full w-[120px] h-[60px]`}
        >
          Swap
        </button>
        <button
          onClick={handleSendClick}
          className={`${
            activeForm === "send" ? "bg-[#545454]" : "bg-[#383838]"
          } text-white px-8 py-2 rounded-full w="[120px]`}
        >
          Send
        </button>
      </div>
      {activeForm === "swap" ? (
        <>
          <div className="bg-[#545454] rounded-[51px] flex flex-col h-[160px] w-[600px]">
            <span className="text-black py-4 pl-14">Sell</span>
            <div className="flex justify-between">
              <label htmlFor="sell-amount" className="sr-only"></label>
              <input
                id="sell-amount"
                value={sellAmount}
                className="text-white text-center pl-10 py-2 bg-transparent focus:outline-none"
                placeholder="amount"
                onChange={(e) => {
                  setTradeDirection("sell");
                  setSellAmount(e.target.value);
                }}
              />
              <div className="mr-4">
                <CustomSelect
                  coins={balances}
                  selectedCoin={sellToken}
                  handleChange={handleSellTokenChange}
                />
              </div>
            </div>
            {/* <div className="flex justify-end mr-16 py-2">
              <span className="text-xs">
                Balance:{" "}
                {balances.find(
                  (b: { symbol: string }) => b.symbol === fromSelectedCoin
                )?.balance || "0"}
              </span>
            </div> */}
          </div>
          <div className="flex justify-center ml-[12.5rem]">
            <div className="bg-[#545454] rounded-full p-2 border-4 border-[#191918]">
              <Image src={downArrow} alt="Arrow Icon" width={30} height={30} />
            </div>
          </div>
          <div className="bg-[#545454] rounded-[51px] flex flex-col h-[160px] w-[600px]">
            <span className="text-black py-4 pl-14">Buy</span>
            <div className="flex justify-between">
              <label htmlFor="buy-amount" className="sr-only"></label>
              <input
                id="buy-amount"
                value={buyAmount}
                className="text-white text-center pl-10 py-2 bg-transparent focus:outline-none"
                disabled
                onChange={(e) => {
                  setTradeDirection("buy");
                  setBuyAmount(e.target.value);
                }}
              />
              <div className="mr-4">
                <CustomSelect
                  coins={coins}
                  selectedCoin={buyToken}
                  handleChange={handleBuyTokenChange}
                />
              </div>
            </div>

            {/* <div className="flex justify-end mr-16 py-2">
              <span className="text-xs">
                Balance:{" "}
                {balances.find(
                  (b: { symbol: string }) => b.symbol === toSelectedCoin
                )?.balance || "0"}
              </span>
            </div> */}
          </div>
          <div className="text-slate-400">
            {price && price.grossBuyAmount
              ? "Affiliate Fee: " +
                Number(
                  formatUnits(
                    BigInt(price.grossBuyAmount),
                    coins[buyToken].decimals
                  )
                ) *
                  AFFILIATE_FEE +
                " " +
                coins[buyToken].symbol
              : null}
          </div>
          {takerAddress ? (
            <ApproveOrReviewButton
              sellTokenAddress={balances[sellToken]?.address}
              takerAddress={takerAddress}
              onClick={() => {
                setFinalize(true);
              }}
              disabled={disabled}
            />
          ) : (
            <ConnectKitButton.Custom>
              {({
                isConnected,
                isConnecting,
                show,
                hide,
                address,
                ensName,
                chain,
              }) => {
                return (
                  <button
                    onClick={show}
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                  >
                    {isConnected ? address : "Connect Wallet"}
                  </button>
                );
              }}
            </ConnectKitButton.Custom>
          )}

          {isLoadingPrice && (
            <div className="text-center mt-2">Fetching the best price...</div>
          )}
        </>
      ) : (
        <div></div>
        // <>
        //   <div className="bg-[#545454] rounded-[51px] flex flex-col h-[160px] w-[600px] mx-auto ">
        //     <span className="text-black py-4 pl-14">You're sending</span>
        //     <div className="flex justify-between items-center ">
        //       <AmountForm placeholderValue="amount" customCss="ml-[9.25rem]" />
        //       <div className="mr-4">
        //         <CustomSelect
        //           coins={coins}
        //           selectedCoin={sendSelectedCoin}
        //           handleChange={handleSendCoinChange}
        //         />
        //       </div>
        //     </div>
        //     <div className="flex justify-end mr-16 py-2">
        //       <span className="text-xs">
        //         Balance:{" "}
        //         {balances.find(
        //           (b: { symbol: string }) => b.symbol === sendSelectedCoin
        //         )?.balance || "0"}
        //       </span>
        //     </div>
        //   </div>
        //   <div className="flex justify-center ml-[12.5rem] ">
        //     <div className="bg-[#545454] rounded-full p-2 border-4 border-[#191918] ">
        //       <Image src={downArrow} alt="Arrow Icon" width={30} height={30} />
        //     </div>
        //   </div>
        //   <div className="bg-[#545454] rounded-[51px] flex  h-[60px] w-[600px] mx-auto">
        //     <span className="text-black py-[1.25rem] pl-14">To</span>
        //     <AmountForm
        //       placeholderValue="Recipient's address"
        //       customCss="ml-20"
        //     />
        //   </div>
        // </>
      )}
      {/* <form>
        <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-md mb-3">
          <section className="mt-4 flex items-start justify-center">
            <label htmlFor="sell-select" className="sr-only"></label>
            <img
              alt={sellToken}
              className="h-9 w-9 mr-2 rounded-md"
              src={POLYGON_TOKENS_BY_SYMBOL[sellToken].logoURI}
            />
            <div className="h-14 sm:w-full sm:mr-2">
              <CustomSelect
                coins={POLYGON_TOKENS}
                selectedCoin={sellToken}
                handleChange={handleSellTokenChange}
              />
            </div>
            <label htmlFor="sell-amount" className="sr-only"></label>
            <input
              id="sell-amount"
              value={sellAmount}
              className="h-9 rounded-md"
              style={{ border: "1px solid black" }}
              onChange={(e) => {
                setTradeDirection("sell");
                setSellAmount(e.target.value);
              }}
            />
          </section>
          <section className="flex mb-6 mt-4 items-start justify-center">
            <label htmlFor="buy-token" className="sr-only"></label>
            <img
              alt={buyToken}
              className="h-9 w-9 mr-2 rounded-md"
              src={POLYGON_TOKENS_BY_SYMBOL[buyToken].logoURI}
            />
            <CustomSelect
              coins={POLYGON_TOKENS}
              selectedCoin={buyToken}
              handleChange={handleBuyTokenChange}
            />
            <label htmlFor="buy-amount" className="sr-only"></label>
            <input
              id="buy-amount"
              value={buyAmount}
              className="h-9 rounded-md bg-white cursor-not-allowed"
              style={{ border: "1px solid black" }}
              disabled
              onChange={(e) => {
                setTradeDirection("buy");
                setBuyAmount(e.target.value);
              }}
            />
          </section>
          <div className="text-slate-400">
            {price && price.grossBuyAmount
              ? "Affiliate Fee: " +
                Number(
                  formatUnits(
                    BigInt(price.grossBuyAmount),
                    POLYGON_TOKENS_BY_SYMBOL[buyToken].decimals
                  )
                ) *
                  AFFILIATE_FEE +
                " " +
                POLYGON_TOKENS_BY_SYMBOL[buyToken].symbol
              : null}
          </div>
        </div>

       
      </form> */}
    </div>
  );
}

function ApproveOrReviewButton({
  takerAddress,
  onClick,
  sellTokenAddress,
  disabled,
}: {
  takerAddress: Address;
  onClick: () => void;
  sellTokenAddress: Address;
  disabled?: boolean;
}) {
  // 1. Read from erc20, does spender (0x Exchange Proxy) have allowance?
  const { data: allowance, refetch } = useContractRead({
    address: sellTokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [takerAddress, exchangeProxy],
  });

  // 2. (only if no allowance): write to erc20, approve 0x Exchange Proxy to spend max integer
  const { config } = usePrepareContractWrite({
    address: sellTokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [exchangeProxy, MAX_ALLOWANCE],
  });

  const {
    data: writeContractResult,
    writeAsync: approveAsync,
    error,
  } = useContractWrite(config);

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: writeContractResult ? writeContractResult.hash : undefined,
    onSuccess(data) {
      refetch();
    },
  });

  if (error) {
    return <div>Something went wrong: {error.message}</div>;
  }

  if (allowance === 0n && approveAsync) {
    return (
      <>
        <button
          type="button"
          className="bg-white text-black px-4 ml-[12rem] py-2 rounded-full w-[240px] my-4  "
          onClick={async () => {
            const writtenValue = await approveAsync();
          }}
        >
          {isApproving ? "Approving…" : "Approve"}
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="bg-white text-black px-4 ml-[12rem] py-2 rounded-full w-[240px] my-4  disabled:opacity-25"
    >
      {disabled ? "Insufficient Balance" : "Review Trade"}
    </button>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import Image from "next/image";
import normalCube from "../../public/normalCube.svg";
import saturatedCube from "../../public/normalCube.svg";
import downArrow from "../../public/downArrow.svg";
import AmountForm from "../components/AmountForm";
import CustomSelect from "../components/CustomSelect";
import { SelectChangeEvent } from "@mui/material";
import { fetchUserBalances } from "../../store/user/reducer";
import { fetchCoins } from "../../store/network/slice";

export default function Home() {
  const [activeForm, setActiveForm] = useState<"swap" | "send">("swap");
  const [fromSelectedCoin, setFromSelectedCoin] = useState<string>("");
  const [toSelectedCoin, setToSelectedCoin] = useState<string>("");
  const [sendSelectedCoin, setSendSelectedCoin] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const currentNetworkSelected = useSelector(
    (state: RootState) => state.network.selectedNetwork
  );
  const userAddress = useSelector((state: RootState) => state.wallet.address);
  const balances = useSelector(
    (state: RootState) => state.userReducer.balances
  );
  const coins = useSelector((state: RootState) => state.network.coins);

  useEffect(() => {
    if (userAddress && currentNetworkSelected) {
      dispatch(fetchCoins(currentNetworkSelected));
      dispatch(fetchUserBalances(userAddress));
    }
  }, [userAddress, currentNetworkSelected, dispatch]);

  const handleSwapClick = () => {
    setActiveForm("swap");
  };

  const handleSendClick = () => {
    setActiveForm("send");
  };

  const handleFromCoinChange = (event: SelectChangeEvent<string>) => {
    setFromSelectedCoin(event.target.value as string);
  };

  const handleToCoinChange = (event: SelectChangeEvent<string>) => {
    setToSelectedCoin(event.target.value as string);
  };

  const handleSendCoinChange = (event: SelectChangeEvent<string>) => {
    setSendSelectedCoin(event.target.value as string);
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, #000000 0%, #0b0b0b 25%, #111111 50%, #171717 75%, #212120 100%)",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      <div className="relative flex justify-center">
        <div className="container mx-auto relative my-[8rem]">
          {/* Cube images */}
          <div className="absolute top-[20rem] right-[18rem] w-full h-full pointer-events-none z-0">
            <Image
              src={normalCube}
              alt="Cube"
              objectFit="contain"
              width={1000}
              height={1400}
            />
          </div>
          <div className="absolute bottom-[10rem] left-[49rem] w-full h-full pointer-events-none z-0">
            <Image
              src={saturatedCube}
              alt="Cube"
              objectFit="contain"
              width={1200}
              height={1600}
            />
          </div>

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
                } text-white px-8 py-2 rounded-full w-[120px]`}
              >
                Send
              </button>
            </div>

            {activeForm === "swap" ? (
              <>
                <div className="bg-[#545454] rounded-[51px] flex flex-col h-[160px] w-[600px]">
                  <span className="text-black py-4 pl-14">Sell</span>
                  <div className="flex justify-between">
                    <AmountForm placeholderValue="amount" />
                    <div className="mr-4">
                      <CustomSelect
                        coins={balances}
                        selectedCoin={fromSelectedCoin}
                        handleChange={handleFromCoinChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mr-16 py-2">
                    <span className="text-xs">
                      Balance:{" "}
                      {balances.find((b) => b.symbol === fromSelectedCoin)
                        ?.balance || "0"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-center ml-[12.5rem]">
                  <div className="bg-[#545454] rounded-full p-2 border-4 border-[#191918]">
                    <Image
                      src={downArrow}
                      alt="Arrow Icon"
                      width={30}
                      height={30}
                    />
                  </div>
                </div>
                <div className="bg-[#545454] rounded-[51px] flex flex-col h-[160px] w-[600px]">
                  <span className="text-black py-4 pl-14">Buy</span>
                  <div className="flex justify-between">
                    <AmountForm placeholderValue="amount" />
                    <div className="mr-4">
                      <CustomSelect
                        coins={coins}
                        selectedCoin={toSelectedCoin}
                        handleChange={handleToCoinChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mr-16 py-2">
                    <span className="text-xs">
                      Balance:{" "}
                      {balances.find((b) => b.symbol === toSelectedCoin)
                        ?.balance || "0"}
                    </span>
                  </div>
                </div>
                <div className="text-center flex justify-center">
                  <button className="bg-white text-black px-4 ml-[13rem] py-2 rounded-full w-[240px] my-4">
                    Swap
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-[#545454] rounded-[51px] flex flex-col h-[160px] w-[600px] mx-auto ">
                  <span className="text-black py-4 pl-14">You're sending</span>
                  <div className="flex justify-between items-center ">
                    <AmountForm
                      placeholderValue="amount"
                      customCss="ml-[9.25rem]"
                    />
                    <div className="mr-4">
                      <CustomSelect
                        coins={coins}
                        selectedCoin={sendSelectedCoin}
                        handleChange={handleSendCoinChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mr-16 py-2">
                    <span className="text-xs">
                      Balance:{" "}
                      {balances.find((b) => b.symbol === sendSelectedCoin)
                        ?.balance || "0"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-center ml-[12.5rem] ">
                  <div className="bg-[#545454] rounded-full p-2 border-4 border-[#191918] ">
                    <Image
                      src={downArrow}
                      alt="Arrow Icon"
                      width={30}
                      height={30}
                    />
                  </div>
                </div>
                <div className="bg-[#545454] rounded-[51px] flex  h-[60px] w-[600px] mx-auto">
                  <span className="text-black py-[1.25rem] pl-14">To</span>
                  <AmountForm
                    placeholderValue="Recipient's address"
                    customCss="ml-20"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import shield from "../../../public/shield.svg";

import SearchIcon from "@mui/icons-material/Search";

import { ConnectKitButton } from "connectkit";
import { Button } from "@mui/material";

const networks = [
  { name: "Ethereum", icon: "/eth.svg" },
  { name: "Bitcoin", icon: "/btc.svg" },
  { name: "Solana", icon: "/sol.svg" },
];

const Navbar = () => {
  return (
    <>
      <div className="w-full h-20 bg-[#000000] sticky top-0 flex items-center font-montserrat ">
        <Image
          priority
          src={shield}
          alt="Aegis Logo"
          className="h-12 w-auto ml-8"
        />
        <Link href="/about">
          <p className="m-6 text-[#FFFFFF]">Trade</p>
        </Link>
        <Link href="/services">
          <p className="m-6 text-[#FFFFFF]">Pool</p>
        </Link>
        <Link href="/contacts">
          <p className="m-6 text-[#FFFFFF]">Explore</p>
        </Link>
        <div className="flex items-center bg-[#545454] rounded-full border-4 border-gray-500 ml-[260px]">
          <SearchIcon className="text-gray-300 ml-2" />
          <input
            type="text"
            placeholder="Search tokens and NFT collections"
            className="w-[400px] px-4 py-2 border-none bg-transparent focus:outline-none focus:none placeholder-white text-white text-center"
          />
        </div>
        <div className="ml-[250px] flex items-center ">
          <div className="flex items-center ml-10">
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={show}
                    className="text-black bg-[#EEE7C6] rounded-full border-4 border-gray-500 h-[40px] font-montserrat"
                  >
                    {isConnected
                      ? ` ${address!.slice(0, 6)}...${address!.slice(-4)}`
                      : "Connect Wallet"}
                  </Button>
                );
              }}
            </ConnectKitButton.Custom>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../../store/store";
import {
  setSelectedNetwork,
  fetchCoins,
} from "../../../../store/network/slice";
import Link from "next/link";
import Image from "next/image";
import shield from "../../../../public/shield.svg";
import WalletSelectionDialog from "../../WalletSelectionDialog";
import {
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const networks = [
  { name: "Ethereum", icon: "/eth.svg" },
  { name: "Bitcoin", icon: "/btc.svg" },
  { name: "Solana", icon: "/sol.svg" },
];

const Navbar = () => {
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const selectedNetwork = useSelector(
    (state: RootState) => state.network.selectedNetwork
  );
  const userAddress = useSelector((state: RootState) => state.wallet.address); // Get the address from Redux

  const handleNetworkChange = async (event: SelectChangeEvent<string>) => {
    const newNetwork = event.target.value as string;
    dispatch(setSelectedNetwork(newNetwork));
    dispatch(fetchCoins(newNetwork));
  };
  const handleConnectWallet = (walletType: string) => {
    setWalletDialogOpen(false);
  };

  return (
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
        <div className="mx-8">
          <Select
            value={selectedNetwork}
            onChange={handleNetworkChange}
            displayEmpty
            className="text-white bg-transparent rounded-full  mx-4 outline-0"
            inputProps={{ "aria-label": "Without label" }}
            IconComponent={ExpandMoreIcon}
            sx={{
              ".MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "&.Mui-focused": {
                backgroundColor: "#545454",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "& .MuiSelect-select": {
                paddingLeft: "12px", // adjust padding to align icon
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
              "& .MuiSvgIcon-root": {
                color: "#545454", // Change the color of the icon here
              },
            }}
          >
            {networks.map((network) => (
              <MenuItem key={network.name} value={network.name}>
                <div className="flex items-center ">
                  <Image
                    src={network.icon}
                    alt={network.name}
                    width={20}
                    height={20}
                    className="mr-2"
                  />
                  {network.name}
                </div>
              </MenuItem>
            ))}
          </Select>
        </div>
        <div className="flex items-center ml-8">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setWalletDialogOpen(true)}
            className="text-black bg-[#EEE7C6] rounded-full border-4 border-gray-500 h-[40px] font-montserrat"
          >
            {userAddress !== null
              ? ` ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`
              : "Connect Wallet"}
          </Button>
        </div>
      </div>

      <WalletSelectionDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        onConnectWallet={handleConnectWallet}
        selectedNetwork={selectedNetwork} // Pass selected network to the dialog
      />
    </div>
  );
};

export default Navbar;

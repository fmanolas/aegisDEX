import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { setAddress } from "../../store/wallet/slice";

interface WalletSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConnectWallet: (walletType: string) => void;
  selectedNetwork: string;
}

const WalletSelectionDialog: React.FC<WalletSelectionDialogProps> = ({
  open,
  onClose,
  onConnectWallet,
  selectedNetwork,
}) => {
  const dispatch = useDispatch();

  const ethereumWallets = [
    { name: "MetaMask", icon: "/metamask.svg" },
    { name: "OKX Wallet", icon: "/okx.svg" },
    { name: "Phantom", icon: "/phantom.svg" },
    { name: "Coinbase", icon: "/coinbase.svg" },
  ];

  const otherWallets = [
    { name: "WalletConnect", icon: "/walletconnect.svg" },
    { name: "Coinbase Wallet", icon: "/coinbase.svg" },
  ];

  const wallets =
    selectedNetwork === "Ethereum" ? ethereumWallets : otherWallets;

  const handleWalletConnect = async (walletType: string) => {
    try {
      let address = "";
      // Add your wallet connection logic here
      if (walletType === "MetaMask") {
        if (window.ethereum) {
          let provider;
          if (await window.ethereum.providers) {
            provider = await window.ethereum.providers?.find(
              (p: any) => p.isMetaMask
            );
          }
          if (provider) {
            const accounts = await provider.request({
              method: "eth_requestAccounts",
            });
            address = accounts[0];
          } else if (window.ethereum.isMetaMask) {
            provider = window.ethereum;
            const accounts = await provider.request({
              method: "eth_requestAccounts",
            });
            address = accounts[0];
          } else {
            alert("MetaMask Wallet not installed!");
            return;
          }
          // const accounts = await window.ethereum.request({
          //   method: "eth_requestAccounts",
          // });
          // address = accounts[0];
        } else {
          alert("MetaMask not installed!");
          return;
        }
      } else if (walletType === "OKX Wallet") {
        if (typeof window.okxwallet !== "undefined") {
          const accounts = await window.okxwallet.request({
            method: "eth_requestAccounts",
          });
          address = accounts[0];
        } else {
          alert("OKX Wallet not installed!");
          return;
        }
      } else if (walletType === "Phantom") {
        if (typeof window.phantom !== "undefined") {
          const accounts = await window.phantom.ethereum.request({
            method: "eth_requestAccounts",
          });
          address = accounts[0];
        } else {
          alert("Phantom is not installed!");
          return;
        }
      } else if (walletType === "Coinbase") {
        if (window.ethereum) {
          let provider;
          if (await window.ethereum?.providers) {
            provider = window.ethereum.providers.find(
              (p: any) => p.isCoinbaseWallet
            );
          }
          if (provider) {
            const accounts = await provider.request({
              method: "eth_requestAccounts",
            });
            address = accounts[0];
          } else if (window.ethereum.isCoinbaseWallet) {
            provider = window.ethereum;
            const accounts = await provider.request({
              method: "eth_requestAccounts",
            });
            address = accounts[0];
          } else {
            alert("Coinbase Wallet not installed!");
            return;
          }
        } else {
          alert("Coinbase Wallet not installed!");
          return;
        }
      } else if (walletType === "WalletConnect") {
        // Add WalletConnect connection logic
      }

      // Dispatch the address to the Redux store
      dispatch(setAddress(address));
      // Close the dialog after connection
      onClose();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="text-center font-montserrat">
        Select Wallet
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} justifyContent="center" className=" ">
          {wallets.map((wallet, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              key={wallet.name}
              style={{ display: "flex", justifyContent: "center" }}
              className={`${index % 2 !== 0 ? "border-l-1" : ""}${
                index % 2 === 0 ? "border-r-0" : ""
              } border overflow-hidden`}
              onClick={() => handleWalletConnect(wallet.name)}
            >
              <Box
                className="flex flex-col items-center p-4 "
                sx={{
                  width: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={wallet.icon}
                  alt={wallet.name}
                  width={140}
                  height={140}
                />
                <Typography variant="body1" className="mt-2 font-montserrat">
                  {wallet.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions className="flex justify-center font-montserrat">
        <Button className="font-montserrat text-black" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletSelectionDialog;

// components/Button.tsx

import React from "react";
import { Button } from "@mui/material";
import { ethers } from "ethers";

interface WalletButtonProps {
  walletType: string;
  onConnect: (address: string) => void;
  onError: (error: Error) => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({
  walletType,
  onConnect,
  onError,
}) => {
  const handleConnectWallet = async () => {
    try {
      if (walletType === "MetaMask") {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const address = await (await signer).getAddress();
          onConnect(address);
        } else {
          alert("MetaMask is not installed");
        }
      }
      // Add logic for other wallets here
    } catch (error: any) {
      console.error("Error connecting to wallet:", error);
      onError(error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleConnectWallet}
      className="text-black bg-[#EEE7C6] rounded-full border-4 border-gray-500 h-[40px]"
    >
      Connect Wallet
    </Button>
  );
};

export default WalletButton;

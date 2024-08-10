import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { useEffect, useState } from "react";
import Navbar from "@/components/navigation/navbar";
import { Provider } from "react-redux";
import { store } from "@/lib/store";

const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: `${process.env.ALCHEMY_PROJECT_ID}`,
    walletConnectProjectId: `${process.env.WALLET_CONNECT_ID}`,

    // Required
    appName: "AegisDEX",
  })
);

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <Provider store={store}>
            <Navbar /> {/* Add the Navbar at the top */}
            <div>{mounted && <Component {...pageProps} />}</div>
          </Provider>
        </ConnectKitProvider>
      </WagmiConfig>
    </div>
  );
}

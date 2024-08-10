import { useState } from "react";
import PriceView from "./Price";
import QuoteView from "./Quote";
import type { PriceResponse } from "./api/types";
import { useAccount } from "wagmi";
import Image from "next/image";
import normalCube from "../public/normalCube.svg";
import saturatedCube from "../public/normalCube.svg";

export default function Home() {
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<PriceResponse | undefined>();
  const [quote, setQuote] = useState();
  const { address } = useAccount();

  return (
    <main
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
          {finalize && price ? (
            <QuoteView
              takerAddress={address}
              price={price}
              quote={quote}
              setQuote={setQuote}
            />
          ) : (
            <PriceView
              takerAddress={address}
              price={price}
              setPrice={setPrice}
              setFinalize={setFinalize}
            />
          )}
        </div>
      </div>
    </main>
  );
}

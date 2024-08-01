"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "../components/navigation";
import store from "../../store/store";
import { Provider } from "react-redux";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Provider store={store}>
          <Navigation />
          {children}
        </Provider>
      </body>
    </html>
  );
}

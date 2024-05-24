import { WalletProvider, createWallet } from "@swapkit/wallet-exodus";
import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "./App";

export const wallet = createWallet({
  appId: "994f3903-5054-447e-bddf-a57874c973fb",
  networks: {
    bitcoin: true,
    ethereum: true,
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <WalletProvider wallet={wallet}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </WalletProvider>
);

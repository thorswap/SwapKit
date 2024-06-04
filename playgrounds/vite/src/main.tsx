import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "./App";

// export const wallet = createWallet({
//   appId: "",
//   networks: {
//     bitcoin: true,
//     ethereum: true,
//   },
// });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  //   <WalletProvider wallet={wallet}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  //   </WalletProvider>
);

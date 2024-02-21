import { SwapKitCore } from "@swapkit/core";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
// import { keystoreWallet } from "@swapkit/wallet-keystore";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const swapKitAtom = atom<SwapKitCore | null>(null);

export const useSwapKit = () => {
  const [swapKit, setSwapKit] = useAtom(swapKitAtom);

  useEffect(() => {
    const swapKitCore = new SwapKitCore({});

    swapKitCore.extend({
      config: {
        blockchairApiKey:
          process.env.NEXT_PUBLIC_BLOCKCHAIR_API_KEY || "A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf",
        covalentApiKey:
          process.env.NEXT_PUBLIC_COVALENT_API_KEY || "cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q",
        ethplorerApiKey: process.env.NEXT_PUBLIC_ETHPLORER_API_KEY || "freekey",
        walletConnectProjectId: "",
      },
      wallets: [
        // keystoreWallet,
        xdefiWallet,
        ledgerWallet,
        trezorWallet,
        keepkeyWallet,
        okxWallet,
        keplrWallet,
        evmWallet,
        walletconnectWallet,
      ],
    });

    setSwapKit(swapKitCore);
  }, [setSwapKit]);

  return { swapKit, setSwapKit };
};

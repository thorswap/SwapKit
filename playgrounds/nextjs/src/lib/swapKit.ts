import { ChainflipProvider } from "@swapkit/chainflip";
import { type AssetValue, type Chain, SwapKit, WalletOption } from "@swapkit/core";
import { ThorchainProvider } from "@swapkit/thorchain";
import type { evmWallet } from "@swapkit/wallet-evm-extensions";
import type { keepkeyWallet } from "@swapkit/wallet-keepkey";
import type { keplrWallet } from "@swapkit/wallet-keplr";
import type { keystoreWallet } from "@swapkit/wallet-keystore";
import type { ledgerWallet } from "@swapkit/wallet-ledger";
import type { okxWallet } from "@swapkit/wallet-okx";
import type { trezorWallet } from "@swapkit/wallet-trezor";
import type { walletconnectWallet } from "@swapkit/wallet-wc";

import { xdefiWallet } from "@swapkit/wallet-xdefi";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";

type SupportedWallet =
  | typeof evmWallet
  | typeof keplrWallet
  | typeof keystoreWallet
  | typeof keepkeyWallet
  | typeof ledgerWallet
  | typeof okxWallet
  | typeof trezorWallet
  | typeof walletconnectWallet
  | typeof xdefiWallet;

type ConnectWalletType = Record<
  SupportedWallet["connectMethodName"][number],
  (connectParams: Todo) => string | undefined
>;
type SwapKitClient = ReturnType<
  typeof SwapKit<
    {
      thorchain: ReturnType<typeof ThorchainProvider>["methods"];
      chainflip: ReturnType<typeof ChainflipProvider>["methods"];
    },
    ConnectWalletType
  >
>;

const swapKitAtom = atom<SwapKitClient | null>(null);
const balanceAtom = atom<AssetValue[]>([]);
const walletState = atom<{ connected: boolean; type: WalletOption | null }>({
  connected: false,
  type: null,
});

export const useSwapKit = () => {
  const [swapKit, setSwapKit] = useAtom(swapKitAtom);
  const [balances, setBalances] = useAtom(balanceAtom);
  const [{ type: walletType, connected: isWalletConnected }, setWalletState] = useAtom(walletState);

  useEffect(() => {
    const loadSwapKit = async () => {
      const { evmWallet } = await import("@swapkit/wallet-evm-extensions");
      const { keepkeyWallet } = await import("@swapkit/wallet-keepkey");
      const { keplrWallet } = await import("@swapkit/wallet-keplr");
      const { keystoreWallet } = await import("@swapkit/wallet-keystore");
      const { ledgerWallet } = await import("@swapkit/wallet-ledger");
      const { okxWallet } = await import("@swapkit/wallet-okx");
      const { trezorWallet } = await import("@swapkit/wallet-trezor");
      const { walletconnectWallet } = await import("@swapkit/wallet-wc");

      const swapKitClient: SwapKitClient = SwapKit({
        apis: {},
        rpcUrls: {},
        config: {
          blockchairApiKey:
            process.env.NEXT_PUBLIC_BLOCKCHAIR_API_KEY || "A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf",
          covalentApiKey:
            process.env.NEXT_PUBLIC_COVALENT_API_KEY || "cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q",
          ethplorerApiKey: process.env.NEXT_PUBLIC_ETHPLORER_API_KEY || "freekey",
          walletConnectProjectId: "",
          keepkeyConfig: {
            apiKey: localStorage.getItem("keepkeyApiKey") || "",
            pairingInfo: {
              name: "THORSwap",
              imageUrl: "https://www.thorswap.finance/logo.png",
              basePath: "swap",
              url: "https://app.thorswap.finance",
            },
          },
        },
        wallets: [
          // @ts-expect-error
          keystoreWallet,
          // @ts-expect-error
          xdefiWallet,
          // @ts-expect-error
          ledgerWallet,
          // @ts-expect-error
          trezorWallet,
          // @ts-expect-error
          keepkeyWallet,
          // @ts-expect-error
          okxWallet,
          // @ts-expect-error
          keplrWallet,
          // @ts-expect-error
          evmWallet,
          // @ts-expect-error
          walletconnectWallet,
        ],

        // @ts-expect-error
        plugins: [ThorchainProvider, ChainflipProvider],
      });

      setSwapKit(swapKitClient);
    };

    loadSwapKit();
  }, [setSwapKit]);

  const getBalances = useCallback(
    async (refresh?: boolean) => {
      if (!refresh && balances.length) return;

      const connectedChains =
        (Object.keys(swapKit?.connectedChains || {}).filter(Boolean) as Chain[]) || [];

      let nextBalances: AssetValue[] = [];

      for (const chain of connectedChains) {
        const balance = await swapKit?.getBalance(chain);

        if (balance) {
          nextBalances = nextBalances.concat(balance);
        }
      }

      setBalances(nextBalances.sort((a, b) => a.getValue("number") - b.getValue("number")));
    },
    [swapKit, setBalances, balances],
  );

  const connectWallet = useCallback(
    (option: WalletOption, chains: Chain[]) => {
      switch (option) {
        case WalletOption.XDEFI: {
          swapKit?.connectXDEFI(chains);
          break;
        }

        default:
          break;
      }

      setWalletState({ connected: !!swapKit?.getAddress(chains[0]), type: option });

      getBalances();
    },
    [setWalletState, getBalances, swapKit],
  );

  const disconnectWallet = useCallback(() => {
    for (const chain of Object.keys(swapKit?.connectedChains || {})) {
      swapKit?.disconnectChain(chain as Chain);
    }

    setWalletState({ connected: false, type: null });
  }, [setWalletState, swapKit]);

  const checkIfChainConnected = useCallback(
    (chain: Chain) => !!swapKit?.getAddress(chain),
    [swapKit?.getAddress],
  );

  return {
    balances,
    checkIfChainConnected,
    connectWallet,
    disconnectWallet,
    getBalances,
    isWalletConnected,
    setSwapKit,
    swapKit,
    walletType,
  };
};

import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";
import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.BinanceSmartChainHex,
  chainName: "Smart Chain",
  nativeCurrency: { name: "Binance Coin", symbol: Chain.Binance, decimals: BaseDecimal.BSC },
  rpcUrls: ["https://bsc-dataseed.binance.org"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.BinanceSmartChain]],
});

export const BSCToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  const bscApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.BinanceSmartChain });
  const baseToolbox = BaseEVMToolbox({ provider, signer, isEIP1559Compatible: false });

  return {
    ...baseToolbox,
    getNetworkParams,
    getBalance: (
      address: string,
      potentialScamFilter = true,
      overwriteProvider?: JsonRpcProvider | BrowserProvider,
    ) =>
      getBalance({
        provider: overwriteProvider || provider,
        api: bscApi,
        address,
        chain: Chain.BinanceSmartChain,
        potentialScamFilter,
      }),
  };
};

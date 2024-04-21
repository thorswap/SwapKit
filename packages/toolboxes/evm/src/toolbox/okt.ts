import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.OKXChain,
  chainName: "OKXChain Mainnet",
  nativeCurrency: { name: "OKXChain Mainnet", symbol: Chain.OKXChain, decimals: BaseDecimal.OKT },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://exchainrpc.okex.org"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.OKXChain]],
});

export const OKTToolbox = ({
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
  const oktApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.OKXChain });
  const baseToolbox = BaseEVMToolbox({ provider, signer });

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
        api: oktApi,
        address,
        chain: Chain.OKXChain,
        potentialScamFilter,
      }),
  };
};

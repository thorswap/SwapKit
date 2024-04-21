import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.PulseChain,
  chainName: "PulseChain",
  nativeCurrency: { name: "PulseChain", symbol: Chain.PulseChain, decimals: BaseDecimal.PLS },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://rpc.pulsechain.com"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.PulseChain]],
});

export const PLSToolbox = ({
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
  const plsApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.PulseChain });
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
        api: plsApi,
        address,
        chain: Chain.PulseChain,
        potentialScamFilter,
      }),
  };
};

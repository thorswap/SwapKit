import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.Fantom,
  chainName: "Fantom",
  nativeCurrency: { name: "Fantom Opera", symbol: Chain.Fantom, decimals: BaseDecimal.FTM },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://rpcapi.fantom.network"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Fantom]],
});

export const FTMToolbox = ({
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
  const ftmApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Fantom });
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
        api: fmtApi,
        address,
        chain: Chain.Fantom,
        potentialScamFilter,
      }),
  };
};

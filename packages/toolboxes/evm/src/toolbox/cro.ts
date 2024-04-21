import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.Cronos,
  chainName: "Cronos Mainnet",
  nativeCurrency: { name: "Cronos Mainnet", symbol: Chain.Cronos, decimals: BaseDecimal.CRO },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://evm.cronos.org"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Cronos]],
});

export const CROToolbox = ({
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
  const crpApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Cronos });
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
        api: croApi,
        address,
        chain: Chain.Cronos,
        potentialScamFilter,
      }),
  };
};

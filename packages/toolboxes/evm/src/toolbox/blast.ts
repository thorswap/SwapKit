import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.Blast,
  chainName: "Blast",
  nativeCurrency: { name: "Ethereum", symbol: Chain.Ethereum, decimals: BaseDecimal.ETH },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://rpc.blast.io"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Blast]],
});

export const BLASTToolbox = ({
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
  const blastApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Blast });
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
        api: blastApi,
        address,
        chain: Chain.Blast,
        potentialScamFilter,
      }),
  };
};

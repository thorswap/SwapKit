import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.Gnosis,
  chainName: "Gnosis",
  nativeCurrency: { name: "Gnosis", symbol: Chain.Gnosis, decimals: BaseDecimal.XDAI },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://rpc.gnosischain.com"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Gnosis]],
});

export const GNOToolbox = ({
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
  const gnoApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Gnosis });
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
        api: gnoApi,
        address,
        chain: Chain.Gnosis,
        potentialScamFilter,
      }),
  };
};

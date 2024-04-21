import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.Telos,
  chainName: "Telos EVM Mainnet",
  nativeCurrency: { name: "Telos EVM Mainnet", symbol: Chain.Telos, decimals: BaseDecimal.TLOS },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://mainnet-eu.telos.net/evm"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Telos]],
});

export const TLOSToolbox = ({
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
  const tlosApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Telos });
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
        api: tlosApi,
        address,
        chain: Chain.Telos,
        potentialScamFilter,
      }),
  };
};

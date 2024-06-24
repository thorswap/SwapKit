import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl, type FeeOption } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";

import type { CovalentApiType } from "../api/covalentApi.ts";
import { covalentApi } from "../api/covalentApi.ts";
import { type EVMTxBaseParams, estimateTransactionFee, getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

const getNetworkParams = () => ({
  chainId: ChainId.AvalancheHex,
  chainName: "Avalanche Network",
  nativeCurrency: { name: "Avalanche", symbol: Chain.Avalanche, decimals: BaseDecimal.AVAX },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Avalanche]],
});

export const AVAXToolbox = ({
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
  const avaxApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Avalanche });
  const baseToolbox = BaseEVMToolbox({ provider, signer });
  const chain = Chain.Avalanche;

  return {
    ...baseToolbox,
    getNetworkParams,
    estimateTransactionFee: (txObject: EVMTxBaseParams, feeOptionKey: FeeOption) =>
      estimateTransactionFee(txObject, feeOptionKey, chain, provider),
    getBalance: (
      address: string,
      potentialScamFilter = true,
      overwriteProvider?: JsonRpcProvider | BrowserProvider,
    ) =>
      getBalance({
        provider: overwriteProvider || provider,
        api: avaxApi,
        address,
        chain,
        potentialScamFilter,
      }),
  };
};

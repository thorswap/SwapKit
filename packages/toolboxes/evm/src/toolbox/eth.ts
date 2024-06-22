import { Chain, type FeeOption } from "@swapkit/helpers";
import type { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Signer } from "ethers";

import type { EthplorerApiType } from "../api/ethplorerApi.ts";
import { ethplorerApi } from "../api/ethplorerApi.ts";
import { type EVMTxBaseParams, estimateTransactionFee, getBalance } from "../index.ts";

import { BaseEVMToolbox } from "./BaseEVMToolbox.ts";

export const ETHToolbox = ({
  api,
  ethplorerApiKey,
  signer,
  provider,
}: {
  api?: EthplorerApiType;
  ethplorerApiKey: string;
  signer?: Signer | JsonRpcSigner;
  provider: JsonRpcProvider | BrowserProvider;
}) => {
  const ethApi = api || ethplorerApi(ethplorerApiKey);
  const baseToolbox = BaseEVMToolbox({ provider, signer });
  const chain = Chain.Ethereum;

  return {
    ...baseToolbox,
    estimateTransactionFee: (txObject: EVMTxBaseParams, feeOptionKey?: FeeOption) =>
      estimateTransactionFee(txObject, feeOptionKey, chain, provider),
    getBalance: (
      address: string,
      potentialScamFilter = true,
      overwriteProvider?: JsonRpcProvider | BrowserProvider,
    ) =>
      getBalance({
        provider: overwriteProvider || provider,
        api: ethApi,
        address,
        chain,
        potentialScamFilter,
      }),
  };
};

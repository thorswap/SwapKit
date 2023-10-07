import { AssetValue } from '@swapkit/helpers';
import { BaseDecimal, Chain } from '@swapkit/types';
import type { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Provider, Signer } from 'ethers';

import type { EthplorerApiType } from '../api/ethplorerApi.ts';
import { ethplorerApi } from '../api/ethplorerApi.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (
  provider: Provider | BrowserProvider,
  api: EthplorerApiType,
  address: string,
) => {
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);

  return [
    new AssetValue({
      chain: Chain.Ethereum,
      symbol: Chain.Ethereum,
      value: evmGasTokenBalance.toString(),
      decimal: BaseDecimal.ETH,
    }),
    ...tokenBalances,
  ];
};

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

  return {
    ...baseToolbox,
    getBalance: (address: string) => getBalance(provider, ethApi, address),
  };
};

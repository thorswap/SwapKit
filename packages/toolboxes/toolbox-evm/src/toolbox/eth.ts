import type { Provider } from '@ethersproject/abstract-provider';
import type { Signer } from '@ethersproject/abstract-signer';
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { BaseDecimal, Chain } from '@thorswap-lib/types';

import type { EthplorerApiType } from '../api/ethplorerApi.ts';
import { ethplorerApi } from '../api/ethplorerApi.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (
  provider: Provider | Web3Provider,
  api: EthplorerApiType,
  address: string,
) => {
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ETH);

  return [
    { asset: getSignatureAssetFor(Chain.Ethereum), amount: evmGasTokenBalanceAmount },
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
  signer?: Signer;
  provider: JsonRpcProvider | Web3Provider;
}) => {
  const ethApi = api || ethplorerApi(ethplorerApiKey);
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    getBalance: (address: string) => getBalance(provider, ethApi, address),
  };
};

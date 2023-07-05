import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain } from '@thorswap-lib/types';

import { ethplorerApi, EthplorerApiType } from '../api/ethplorerApi.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (provider: Provider, api: EthplorerApiType, address: Address) => {
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
  provider: Provider | Web3Provider;
}) => {
  const ethApi = api || ethplorerApi(ethplorerApiKey);
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    getBalance: (address: string) => getBalance(provider, ethApi, address),
  };
};

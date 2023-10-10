import { Chain } from '@swapkit/types';
import type { BrowserProvider, JsonRpcProvider, JsonRpcSigner, Signer } from 'ethers';

import type { EthplorerApiType } from '../api/ethplorerApi.ts';
import { ethplorerApi } from '../api/ethplorerApi.ts';
import { getBalance } from '../index.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

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
    getBalance: (address: string) => getBalance(provider, ethApi, address, Chain.Ethereum),
  };
};

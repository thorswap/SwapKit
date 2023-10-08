import { AssetValue } from '@swapkit/helpers';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from '@swapkit/types';
import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';
import { getProvider } from '../provider.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (api: CovalentApiType, address: string) => {
  const provider = getProvider(Chain.Avalanche);
  const tokenBalances = await api.getBalance(address);

  const evmGasTokenBalance = await provider.getBalance(address);

  return [
    new AssetValue({
      chain: Chain.Avalanche,
      symbol: Chain.Avalanche,
      value: evmGasTokenBalance.toString(),
      decimal: BaseDecimal.AVAX,
    }),
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.AvalancheHex,
  chainName: 'Avalanche Network',
  nativeCurrency: { name: 'Avalanche', symbol: Chain.Avalanche, decimals: BaseDecimal.AVAX },
  // Use external rpc URL so wallets don't throw warning to user
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
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

  return {
    ...baseToolbox,
    getNetworkParams,
    getBalance: (address: string) => getBalance(avaxApi, address),
  };
};

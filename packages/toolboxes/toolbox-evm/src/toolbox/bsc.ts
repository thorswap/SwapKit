import { AssetValue } from '@thorswap-lib/swapkit-helpers';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl } from '@thorswap-lib/types';
import type { BrowserProvider, JsonRpcProvider, Provider, Signer } from 'ethers';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (provider: Provider, api: CovalentApiType, address: string) => {
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);

  return [
    new AssetValue({
      chain: Chain.BinanceSmartChain,
      symbol: Chain.BinanceSmartChain,
      value: evmGasTokenBalance.toString(),
      decimal: BaseDecimal.BSC,
    }),
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.BinanceSmartChainHex,
  chainName: 'Smart Chain',
  nativeCurrency: { name: 'Binance Coin', symbol: Chain.Binance, decimals: BaseDecimal.BSC },
  rpcUrls: ['https://bsc-dataseed.binance.org'],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.BinanceSmartChain]],
});

export const BSCToolbox = ({
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
  const bscApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.BinanceSmartChain });
  const baseToolbox = BaseEVMToolbox({ provider, signer, isEIP1559Compatible: false });

  return {
    ...baseToolbox,
    getNetworkParams,
    getBalance: (address: string) => getBalance(provider, bscApi, address),
  };
};

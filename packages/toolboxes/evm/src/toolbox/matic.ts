import { AssetValue } from '@swapkit/helpers';
import { BaseDecimal, Chain, ChainId, ChainToExplorerUrl, RPCUrl } from '@swapkit/types';
import type { BrowserProvider, JsonRpcProvider, Signer } from 'ethers';

import type { CovalentApiType } from '../api/covalentApi.ts';
import { covalentApi } from '../api/covalentApi.ts';
import { getProvider } from '../provider.ts';

import { BaseEVMToolbox } from './BaseEVMToolbox.ts';

export const getBalance = async (api: CovalentApiType, address: string) => {
  const provider = getProvider(Chain.Polygon);
  const tokenBalances = await api.getBalance(address);
  const evmGasTokenBalance = await provider.getBalance(address);

  return [
    new AssetValue({
      chain: Chain.Polygon,
      symbol: Chain.Polygon,
      value: evmGasTokenBalance.toString(),
      decimal: BaseDecimal.MATIC,
    }),
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.PolygonHex,
  chainName: 'Polygon Mainnet',
  nativeCurrency: { name: 'Polygon', symbol: Chain.Polygon, decimals: BaseDecimal.MATIC },
  rpcUrls: [RPCUrl.Polygon],
  blockExplorerUrls: [ChainToExplorerUrl[Chain.Polygon]],
});

export const MATICToolbox = ({
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
  const maticApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Polygon });
  const baseToolbox = BaseEVMToolbox({ provider, signer });

  return {
    ...baseToolbox,
    getNetworkParams,
    getBalance: (address: string) => getBalance(maticApi, address),
  };
};

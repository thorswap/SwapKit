import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId } from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';
import { getProvider } from '../provider.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (
  api: CovalentApiType,
  address: Address,
  assets?: AssetEntity[],
) => {
  const provider = getProvider(Chain.Arbitrum);
  const tokenBalances = await api.getBalance(address);

  if (assets) {
    return tokenBalances.filter(({ asset }) =>
      assets.find(({ chain, symbol }) => chain === asset.chain && symbol === asset.symbol),
    );
  }

  const evmGasTokenBalance = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ARB);
  return [
    { asset: getSignatureAssetFor(Chain.Arbitrum), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.ArbitrumHex,
  chainName: 'Arbitrum One',
  nativeCurrency: {
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
  },
  rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://arbiscan.io/'],
});

export const ARBToolbox = ({
  api,
  provider,
  signer,
  covalentApiKey,
}: {
  api?: CovalentApiType;
  covalentApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const arbApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.Arbitrum });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) => getBalance(arbApi, address, assets),
  };
};

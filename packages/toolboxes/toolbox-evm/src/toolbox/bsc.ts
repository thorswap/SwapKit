import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId, RPCUrl } from '@thorswap-lib/types';

import { covalentApi, CovalentApiType } from '../api/covalentApi.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

export const getBalance = async (
  provider: Provider,
  api: CovalentApiType,
  address: Address,
  assets?: AssetEntity[],
) => {
  const tokenBalances = await api.getBalance(address);

  if (assets) {
    return tokenBalances.filter((balance) =>
      assets.find(
        ({ chain, symbol }) => chain === balance.asset.chain && symbol === balance.asset.symbol,
      ),
    );
  }

  const evmGasTokenBalance = await provider.getBalance(address);
  return [
    {
      asset: getSignatureAssetFor(Chain.BinanceSmartChain),
      amount: baseAmount(evmGasTokenBalance, BaseDecimal.ETH),
    },
    ...tokenBalances,
  ];
};

export const getNetworkParams = () => ({
  chainId: ChainId.BinanceSmartChain,
  chainName: 'BNB Smart Chain',
  nativeCurrency: {
    name: 'Binance Coin',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: [RPCUrl.BinanceSmartChain],
  blockExplorerUrls: ['https://bscscan.com/'],
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
  provider: Provider | Web3Provider;
}) => {
  const bscApi = api || covalentApi({ apiKey: covalentApiKey, chainId: ChainId.BinanceSmartChain });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) =>
      getBalance(provider, bscApi, address, assets),
  };
};

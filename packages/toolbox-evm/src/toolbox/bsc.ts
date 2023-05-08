import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId, RPCUrl, TxHistoryParams } from '@thorswap-lib/types';

import { CovalentApi } from '../api/covalentApi.js';

import { BaseEVMToolbox } from './BaseEVMToolbox.js';

const BSC_CHAIN_ID = ChainId.BinanceSmartChain;

export const getBalance = async (
  provider: Provider,
  api: CovalentApi,
  address: Address,
  assets?: AssetEntity[],
) => {
  const tokenBalances = await api.getBalance({
    address: address,
    chainId: BSC_CHAIN_ID,
  });

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

export const getTransactions = async (api: CovalentApi, params?: TxHistoryParams) => {
  if (!params?.address) throw new Error('address is required');
  const transactions = await api.getTransactionsForAddress({
    address: params.address,
    chainId: BSC_CHAIN_ID,
  });
  return transactions;
};

export const getTransactionData = async (api: CovalentApi, txHash: string) =>
  api.getTxInfo({ txHash, chainId: BSC_CHAIN_ID });

export const getNetworkParams = () => ({
  chainId: BSC_CHAIN_ID,
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
  provider,
  signer,
  covalentApiKey,
}: {
  covalentApiKey: string;
  signer: Signer;
  provider: Provider | Web3Provider;
}) => {
  const api = new CovalentApi({ apiKey: covalentApiKey });

  return {
    ...BaseEVMToolbox({ provider, signer }),
    getTransactionData: (txHash: string) => getTransactionData(api, txHash),
    getTransactions: (params?: TxHistoryParams) => getTransactions(api, params),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) =>
      getBalance(provider, api, address, assets),
  };
};

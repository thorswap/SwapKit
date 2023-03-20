import { Provider } from '@ethersproject/abstract-provider';
import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity, getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Address, BaseDecimal, Chain, ChainId, RPCUrl, TxHistoryParams } from '@thorswap-lib/types';

import { BaseEVMToolbox, CovalentApi } from '../index.js';

const OPTIMISM_CHAIN_ID = ChainId.Optimism;

export const getBalance = async (
  provider: Provider,
  api: CovalentApi,
  address: Address,
  assets?: AssetEntity[],
) => {
  const tokenBalances = await api.getBalance({
    address: address,
    chainId: OPTIMISM_CHAIN_ID,
  });

  const evmGasTokenBalance: BigNumber = await provider.getBalance(address);
  const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal.ETH);

  if (assets) {
    return tokenBalances.filter((balance) =>
      assets.find(
        (asset) => asset.chain === balance.asset.chain && asset.symbol === balance.asset.symbol,
      ),
    );
  }
  return [
    { asset: getSignatureAssetFor(Chain.Optimism), amount: evmGasTokenBalanceAmount },
    ...tokenBalances,
  ];
};

export const getTransactions = async (api: CovalentApi, params?: TxHistoryParams) => {
  if (!params?.address) throw new Error('address is required');
  const transactions = await api.getTransactionsForAddress({
    address: params.address,
    chainId: OPTIMISM_CHAIN_ID,
  });
  return transactions;
};

export const getTransactionData = async (api: CovalentApi, txHash: string) =>
  api.getTxInfo({ txHash, chainId: OPTIMISM_CHAIN_ID });

export const getNetworkParams = () => ({
  chainId: OPTIMISM_CHAIN_ID,
  chainName: 'Optimism',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [RPCUrl.Optimism],
  blockExplorerUrls: ['https://optimistic.etherscan.io'],
});

export const OPToolbox = ({
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
    getTransactionData: (txId: string) => getTransactionData(api, txId),
    getTransactions: (params?: TxHistoryParams) => getTransactions(api, params),
    getNetworkParams,
    getBalance: (address: string, assets?: AssetEntity[]) =>
      getBalance(provider, api, address, assets),
  };
};

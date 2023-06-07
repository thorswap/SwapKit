import { BigNumber } from '@ethersproject/bignumber';
import { assetFromString, baseAmount, getRequest } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Balance, ChainId, ChainIdToChain } from '@thorswap-lib/types';

import { CovalentBalanceResponse } from '../types/covalentApiTypes.js';

const baseUrl = 'https://api.covalenthq.com/v1';

export const covalentApi = ({ apiKey, chainId }: { apiKey: string; chainId: ChainId }) => ({
  getBalance: async (address: string) => {
    const { data } = await getRequest<{ data: CovalentBalanceResponse }>(
      `${baseUrl}/${chainId}/address/${address}/balances_v2/`,
      { key: apiKey },
    );

    return mapBalanceResponseToBalance(data || { items: [] }, chainId);
  },
});

export type CovalentApiType = ReturnType<typeof covalentApi>;

const mapBalanceResponseToBalance = async (
  data: CovalentBalanceResponse,
  chainId: ChainId,
): Promise<Balance[]> =>
  data.items
    .map(({ balance, contract_decimals, contract_ticker_symbol, contract_address }) => ({
      amount: baseAmount(BigNumber.from(balance.toString()), contract_decimals),
      asset:
        (contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' &&
          assetFromString(
            `${ChainIdToChain[chainId]}.${contract_ticker_symbol}-${contract_address}`,
          )) ||
        getSignatureAssetFor(ChainIdToChain[chainId]),
    }))
    .filter(({ asset: { symbol, ticker } }) => {
      const signatureAsset = getSignatureAssetFor(ChainIdToChain[chainId]);
      return !(symbol === signatureAsset.symbol && ticker === signatureAsset.ticker);
    });

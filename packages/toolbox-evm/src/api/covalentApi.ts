import { BigNumber } from '@ethersproject/bignumber';
import { assetFromString, baseAmount, getRequest } from '@thorswap-lib/helpers';
import { getSignatureAssetFor } from '@thorswap-lib/swapkit-entities';
import { Balance, Chain, ChainId } from '@thorswap-lib/types';

import { EvmApi } from '../types/Api.js';
import { CovalentBalanceResponse } from '../types/covalentApiTypes.js';

const COVALENT_BASE_URL = 'https://api.covalenthq.com/v1';

export interface BaseRequestParams {
  chainId: ChainId;
  apiKey?: string;
}

export interface TokenBalanceRequestParams extends BaseRequestParams {
  address: string;
}

export interface TxInfoRequestParams extends BaseRequestParams {
  txHash: string;
}

export interface TransactionsRequestParams extends BaseRequestParams {
  address: string;
  page?: number;
  pageSize?: number;
}

type RequestParams = TransactionsRequestParams | TokenBalanceRequestParams | TxInfoRequestParams;

export class CovalentApi implements EvmApi<RequestParams> {
  private apiKey: string;

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
  }

  /**
   * Get token balance
   */
  getBalance = async ({ address, chainId }: TokenBalanceRequestParams): Promise<Balance[]> => {
    try {
      const response = await getRequest<{ data: CovalentBalanceResponse }>(
        `${COVALENT_BASE_URL}/${chainId}/address/${address}/balances_v2/`,
        { key: this.apiKey },
      );
      return mapBalanceResponseToBalance(response.data || { items: [] });
    } catch (error) {
      console.error(error);
      return [];
    }
  };
}

const mapBalanceResponseToBalance = async (data: CovalentBalanceResponse): Promise<Balance[]> => {
  const balances = data.items
    .map(({ balance, contract_decimals, contract_ticker_symbol, contract_address }) => ({
      amount: baseAmount(BigNumber.from(balance.toString()), contract_decimals),
      asset:
        (contract_address !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' &&
          assetFromString(`AVAX.${contract_ticker_symbol}-${contract_address}`)) ||
        getSignatureAssetFor(Chain.Avalanche),
    }))
    .filter(
      ({ asset: { chain, symbol, ticker } }) =>
        !(chain === Chain.Avalanche && symbol === chain && ticker === chain),
    );

  return balances;
};

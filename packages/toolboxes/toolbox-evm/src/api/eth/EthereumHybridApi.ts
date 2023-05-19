import { getAddress } from '@ethersproject/address';
import { assetFromString, baseAmount } from '@thorswap-lib/helpers';
import { Balance, Chain } from '@thorswap-lib/types';

import { EvmApi, FullBalanceParams, TokenBalanceParam } from '../../types/index.js';

import { getAddress as getEthplorerAddress } from './ethplorerApi.js';

type RequestParams = TokenBalanceParam | FullBalanceParams;

export class EthereumApi implements EvmApi<RequestParams> {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor({
    apiKey,
    baseUrl = 'https://api.ethplorer.io',
  }: {
    apiKey: string;
    baseUrl?: string;
  }) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  getBalance = async ({ address }: FullBalanceParams): Promise<Balance[]> => {
    const account = await getEthplorerAddress({
      address,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
    });

    const tokenBalances = account.tokens
      ? account.tokens.reduce((acc, token) => {
          const { symbol, decimals, address } = token.tokenInfo;
          const tokenAsset = assetFromString(`${Chain.Ethereum}.${symbol}-${getAddress(address)}`);
          if (tokenAsset) {
            return [
              ...acc,
              { asset: tokenAsset, amount: baseAmount(token.rawBalance, parseInt(decimals)) },
            ];
          }
          return acc;
        }, [] as Balance[])
      : [];

    return Promise.all(tokenBalances);
  };
}

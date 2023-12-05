import { formatBigIntToSafeValue, RequestClient } from '@swapkit/helpers';
import { Chain } from '@swapkit/types';

import type { AddressInfo } from '../types/ethplorer-api-types.ts';
const baseUrl = 'https://api.ethplorer.io';

export const ethplorerApi = (apiKey = 'freekey') => ({
  getBalance: async (address: string) => {
    const { tokens = [] } = await RequestClient.get<AddressInfo>(
      `${baseUrl}/getAddressInfo/${address}`,
      { searchParams: { apiKey } },
    );

    return tokens.map(({ tokenInfo: { symbol, decimals, address: tokenAddress }, rawBalance }) => ({
      chain: Chain.Ethereum,
      symbol: tokenAddress ? `${symbol}-${tokenAddress}` : symbol,
      value: formatBigIntToSafeValue({
        value: BigInt(rawBalance),
        decimal: parseInt(decimals),
        bigIntDecimal: parseInt(decimals),
      }),
      decimal: parseInt(decimals),
    }));
  },
});

export type EthplorerApiType = ReturnType<typeof ethplorerApi>;

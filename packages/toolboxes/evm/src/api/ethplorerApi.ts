import {
  assetFromString,
  AssetValue,
  filterAssets,
  formatBigIntToSafeValue,
  getRequest,
} from '@swapkit/helpers';
import { Chain } from '@swapkit/types';

import type { AddressInfo } from '../types/ethplorer-api-types.ts';
const baseUrl = 'https://api.ethplorer.io';

export const ethplorerApi = (apiKey = 'freekey') => ({
  getBalance: async (address: string, potentialScamFilter?: boolean) => {
    const { getAddress } = await import('ethers');
    const { tokens = [] } = await getRequest<AddressInfo>(`${baseUrl}/getAddressInfo/${address}`, {
      apiKey,
    });

    const balances = tokens.reduce((acc, token): AssetValue[] => {
      const { symbol, decimals, address } = token.tokenInfo;

      const tokenAsset = assetFromString(`${Chain.Ethereum}.${symbol}-${getAddress(address)}`);
      if (!tokenAsset) return acc;

      const balance = new AssetValue({
        chain: tokenAsset.chain,
        symbol: tokenAsset.symbol,
        value: formatBigIntToSafeValue({
          value: BigInt(token.rawBalance),
          decimal: parseInt(decimals),
        }),
        decimal: parseInt(decimals),
      });

      return [...acc, balance];
    }, [] as AssetValue[]);

    return potentialScamFilter ? filterAssets(balances) : balances;
  },
});

export type EthplorerApiType = ReturnType<typeof ethplorerApi>;

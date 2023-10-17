import { assetFromString, AssetValue, formatBigIntToSafeValue, getRequest } from '@swapkit/helpers';
import { Chain } from '@swapkit/types';

import type { AddressInfo } from '../types/ethplorer-api-types.ts';
const baseUrl = 'https://api.ethplorer.io';

export const ethplorerApi = (apiKey = 'freekey') => ({
  getBalance: async (address: string) => {
    const { getAddress } = await import('ethers');
    const { tokens } = await getRequest<AddressInfo>(`${baseUrl}/getAddressInfo/${address}`, {
      apiKey,
    });

    return tokens
      ? tokens.reduce((acc, token): AssetValue[] => {
          const { symbol, decimals, address } = token.tokenInfo;

          const tokenAsset = assetFromString(`${Chain.Ethereum}.${symbol}-${getAddress(address)}`);
          if (tokenAsset) {
            return [
              ...acc,
              new AssetValue({
                chain: tokenAsset.chain,
                symbol: tokenAsset.symbol,
                value: formatBigIntToSafeValue({
                  value: BigInt(token.rawBalance),
                  decimal: parseInt(decimals),
                }),
                decimal: parseInt(decimals),
              }),
            ];
          }
          return acc;
        }, [] as AssetValue[])
      : [];
  },
});

export type EthplorerApiType = ReturnType<typeof ethplorerApi>;

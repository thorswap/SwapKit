import { Chain } from '@thorswap-lib/types';

import { BitcoinApi } from '../api/clients.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const BTCToolbox = (apiKey?: string, apiClientOrUrl?: BitcoinApi | string) =>
  BaseUTXOToolbox({
    chain: Chain.Bitcoin,
    apiClient:
      apiClientOrUrl && typeof apiClientOrUrl !== 'string'
        ? apiClientOrUrl
        : new BitcoinApi({
            apiKey,
            nodeUrl: apiClientOrUrl || 'https://node-router.thorswap.net/bitcoin',
            chain: Chain.Bitcoin,
          }),
  });

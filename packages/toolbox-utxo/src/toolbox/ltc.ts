import { Chain } from '@thorswap-lib/types';

import { LitecoinApi } from '../index.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const LTCToolbox = (apiKey?: string, apiClientOrUrl?: LitecoinApi | string) =>
  BaseUTXOToolbox({
    chain: Chain.Litecoin,
    apiClient:
      apiClientOrUrl && typeof apiClientOrUrl !== 'string'
        ? apiClientOrUrl
        : new LitecoinApi({
            apiKey,
            nodeUrl: apiClientOrUrl || 'https://node-router.thorswap.net/litecoin',
            chain: Chain.Litecoin,
          }),
  });

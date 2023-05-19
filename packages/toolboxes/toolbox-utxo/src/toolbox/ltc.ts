import { Chain, RPCUrl } from '@thorswap-lib/types';

import { LitecoinApi } from '../api/clients.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const LTCToolbox = (apiKey?: string, apiClientOrUrl?: LitecoinApi | string) =>
  BaseUTXOToolbox({
    chain: Chain.Litecoin,
    apiClient:
      apiClientOrUrl && typeof apiClientOrUrl !== 'string'
        ? apiClientOrUrl
        : new LitecoinApi({
            apiKey,
            nodeUrl: apiClientOrUrl || RPCUrl.Litecoin,
            chain: Chain.Litecoin,
          }),
  });

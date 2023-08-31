import { Chain, RPCUrl } from '@thorswap-lib/types';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';
import { broadcastTx } from '../api/rpcApi.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const LTCToolbox = ({
  apiKey,
  rpcUrl = RPCUrl.Litecoin,
  apiClient,
}: {
  apiKey?: string;
  rpcUrl?: string;
  apiClient?: BlockchairApiType;
}): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Litecoin,
    broadcastTx: (txHash: string) => broadcastTx({ txHash, rpcUrl }),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Litecoin }),
  });

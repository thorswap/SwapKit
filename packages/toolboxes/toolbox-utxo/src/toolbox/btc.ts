import { Chain, RPCUrl } from '@thorswap-lib/types';

import { blockchairApi, BlockchairApiType } from '../api/blockchairApi.js';
import { broadcastTx } from '../api/rpcApi.js';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.js';

export const BTCToolbox = ({
  apiKey,
  rpcUrl = RPCUrl.Bitcoin,
  apiClient,
}: {
  apiKey?: string;
  rpcUrl?: string;
  apiClient?: BlockchairApiType;
}): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Bitcoin,
    broadcastTx: (txHash: string) => broadcastTx({ txHash, rpcUrl }),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Bitcoin }),
  });

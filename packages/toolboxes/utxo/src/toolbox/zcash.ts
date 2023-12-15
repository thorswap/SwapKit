import { Chain, RPCUrl } from '@coinmasters/types';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import { blockchairApi } from '../api/blockchairApi.ts';
import { broadcastUTXOTx } from '../api/rpcApi.ts';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.ts';

export const ZCASHToolbox = ({
                              apiKey,
                              rpcUrl = RPCUrl.Dash,
                              apiClient,
                            }: {
  apiKey?: string;
  rpcUrl?: string;
  apiClient?: BlockchairApiType;
}): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Zcash,
    broadcastTx: (txHash: string) => broadcastUTXOTx({ txHash, rpcUrl }),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Dash }),
  });

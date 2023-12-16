import { RequestClient } from '@coinmasters/helpers';
import { Chain, RPCUrl } from '@coinmasters/types';

import type { BlockchairApiType } from '../api/blockchairApi.ts';
import { blockchairApi } from '../api/blockchairApi.ts';

import { BaseUTXOToolbox } from './BaseUTXOToolbox.ts';

const baseUrlPioneer = () => `http://127.0.0.1:9001/api/v1`;

const broadcastTx = async (txHash: string) => {
  try {
    console.log('broadcastTx: Initiating with txHash');

    const broadcastData = {
      network: 'DASH',
      serialized: txHash,
      invocationId: 'testingblabla',
      txid: '',
      noBroadcast: false,
    };

    const fullUrl = `${baseUrlPioneer()}/broadcast`;
    console.log('broadcastTx: fullUrl: ', fullUrl);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(broadcastData), // Ensure the data is being stringified
    };

    console.log('broadcastTx: Sending data: ', broadcastData);

    let response = await RequestClient.post(fullUrl, options);

    console.log('broadcastTx: Transaction broadcasted, response: ', response);
    return response;
  } catch (e) {
    console.error('broadcastTx: Error broadcasting transaction', e);
    throw e;
  }
};

export const DASHToolbox = ({
  apiKey,
  rpcUrl = RPCUrl.Dash,
  apiClient,
}: {
  apiKey?: string;
  rpcUrl?: string;
  apiClient?: BlockchairApiType;
}): ReturnType<typeof BaseUTXOToolbox> =>
  BaseUTXOToolbox({
    chain: Chain.Dash,
    broadcastTx: (txHash: string) => broadcastTx(txHash),
    apiClient: apiClient || blockchairApi({ apiKey, chain: Chain.Dash }),
  });

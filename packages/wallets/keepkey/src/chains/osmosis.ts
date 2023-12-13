import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { OsmosisToolbox } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, RPCUrl } from '@coinmasters/types';
import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

import { addressInfoForCoin } from '../coins.ts';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

const DEFAULT_OSMO_FEE_MAINNET = {
  amount: [{ denom: 'uatom', amount: '500' }],
  gas: '200000',
};

export const osmosisWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  try {
    const { address: fromAddress } = (await sdk.address.osmosisGetAddress({
      address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
    })) as { address: string };

    const toolbox = OsmosisToolbox({ server: api });
    DEFAULT_OSMO_FEE_MAINNET.amount[0].amount = String(
      //@ts-ignore
      '500',
    );

    const signTransactionTransfer = async ({
      amount,
      to,
      from,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        let accountInfo = await toolbox.getAccount(fromAddress);
        let { sequence, account_number } = accountInfo?.result?.value;
        console.log('sequence: ', sequence);
        console.log('account_number: ', account_number);

        let unSignedTx = {
          signerAddress: fromAddress,
          signDoc: {
            fee: DEFAULT_OSMO_FEE_MAINNET,
            memo: memo || '',
            sequence: sequence || '0',
            chain_id: ChainId.Osmosis,
            account_number: account_number || '0',
            msgs: [
              {
                value: { amount: [{ denom: 'uosmo', amount }], to_address: to, from_address: from },
                type: 'cosmos-sdk/MsgSend',
              },
            ],
          },
        };
        console.log('unSignedTx: ', unSignedTx);
        console.log('unSignedTx: ', JSON.stringify(unSignedTx));
        const keepKeySignedTx = await sdk.osmosis.osmosisSignAmino(unSignedTx);

        const decodedBytes = atob(keepKeySignedTx.serialized);
        const uint8Array = new Uint8Array(decodedBytes.length);

        for (let i = 0; i < decodedBytes.length; i++) {
          uint8Array[i] = decodedBytes.charCodeAt(i);
        }

        const client = await StargateClient.connect(RPCUrl.Cosmos);
        const response = await client.broadcastTx(uint8Array);

        return response.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
      signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: 'uosmo',
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

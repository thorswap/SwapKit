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
        const accountInfo = await toolbox.getAccount(fromAddress);

        const keepKeySignedTx = await sdk.osmosis.osmosisSignAmino({
          signerAddress: fromAddress,
          signDoc: {
            fee: DEFAULT_OSMO_FEE_MAINNET,
            memo,
            sequence: accountInfo?.sequence.toString() ?? '',
            chain_id: ChainId.Cosmos,
            account_number: accountInfo?.accountNumber.toString() ?? '',
            msgs: [
              {
                value: { amount: [{ denom: 'uatom', amount }], to_address: to, from_address: from },
                type: 'cosmos-sdk/MsgSend',
              },
            ],
          },
        });

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
        amount: assetValue.baseValue.toString(),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

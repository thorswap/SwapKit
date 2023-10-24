import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import type { TransferParams } from '@swapkit/toolbox-cosmos';
import { GaiaToolbox } from '@swapkit/toolbox-cosmos';
import { Chain, ChainId, RPCUrl } from '@swapkit/types';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const cosmosWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  try {
    const { address: fromAddress } = await sdk.address.thorchainGetAddress({
      address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
    });

    const toolbox = GaiaToolbox({ server: api });
    const signTransactionTransfer = async ({
      amount,
      to,
      from,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(from);
        // FIXME: @highlander - this type is missing from source signature

        const keepKeySignedTx = await sdk.cosmos.cosmosSignAmino({
          signerAddress: from,
          signDoc: {
            // TODO: Have gas passed in as a param, ideally a value from a real-time API
            fee: { gas: '290000', amount: [{ denom: 'uatom', amount: '5000' }] },
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
        asset: assetValue?.symbol === 'MUON' ? 'umuon' : 'uatom',
        amount: assetValue.baseValue.toString(),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

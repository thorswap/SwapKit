import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import type { TransferParams } from '@coinmasters/toolbox-cosmos';
import { DEFAULT_COSMOS_FEE_MAINNET, GaiaToolbox } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, RPCUrl } from '@coinmasters/types';

import { addressInfoForCoin } from '../coins.ts';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const cosmosWalletMethods: any = async ({ sdk, api }: { sdk: KeepKeySdk; api: string }) => {
  try {
    const { address: fromAddress } = (await sdk.address.cosmosGetAddress({
      address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
    })) as { address: string };

    const toolbox = GaiaToolbox({ server: api });
    DEFAULT_COSMOS_FEE_MAINNET.amount[0].amount = String(
      (await toolbox?.getFeeRateFromThorswap?.(ChainId.Cosmos)) ?? '500',
    );

    const signTransactionTransfer = async ({
      amount,
      to,
      from,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(fromAddress);

        const keepKeySignedTx = await sdk.cosmos.cosmosSignAmino({
          signerAddress: fromAddress,
          signDoc: {
            fee: DEFAULT_COSMOS_FEE_MAINNET,
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
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

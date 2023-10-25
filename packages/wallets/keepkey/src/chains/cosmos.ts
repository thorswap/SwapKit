import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import type { TransferParams } from '@coinmasters/toolbox-cosmos';

// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { GaiaToolbox, getDenom } from '@coinmasters/toolbox-cosmos';
import type { WalletTxParams } from '@coinmasters/types';
import { Chain, RPCUrl } from '@coinmasters/types';
import type { AssetValue } from '@coinmasters/helpers';

export type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

type CosmosWalletMethodsParams = {
  sdk: KeepKeySdk;
  api?: any;
};

export const cosmosWalletMethods: any = async function (params: CosmosWalletMethodsParams) {
  try {
    let { sdk, api } = params;
    const toolbox = GaiaToolbox({ server: api });
    const getAddress = async () =>
      (
        await sdk.address.cosmosGetAddress({
          address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
        })
      ).address;

    let signTransactionTransfer = async function (params: SignTransactionTransferParams) {
      try {
        const { amount, to, from, memo } = params;
        const accountInfo = await toolbox.getAccount(from);

        const body = {
          signDoc: {
            // TODO: Have gas passed in as a param, ideally a value from a real-time API
            fee: {
              gas: '290000',
              amount: [
                {
                  denom: 'uatom',
                  amount: '5000',
                },
              ],
            },
            msgs: [
              {
                value: {
                  amount: [
                    {
                      denom: 'uatom',
                      amount,
                    },
                  ],
                  to_address: to,
                  from_address: from,
                },
                type: 'cosmos-sdk/MsgSend',
              },
            ],
            memo,
            sequence: accountInfo?.sequence.toString(),
            chain_id: 'cosmoshub-4',
            account_number: accountInfo?.accountNumber.toString(),
          },
          signerAddress: from,
        };
        console.log("body: ", body)
        console.log("body: ", JSON.stringify(body))
        // @ts-ignore
        const keepKeySignedTx = await sdk.cosmos.cosmosSignAmino(body);

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

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      let from = await getAddress();
      const response = await signTransactionTransfer({
        from,
        to: recipient,
        asset: assetValue?.symbol === 'MUON' ? 'umuon' : 'uatom',
        amount: assetValue.baseValue.toString(),
        memo,
      });

      return response;
    };

    return {
      ...toolbox,
      getAddress,
      transfer,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

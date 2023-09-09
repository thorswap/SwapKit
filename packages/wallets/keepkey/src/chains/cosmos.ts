// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import type { Amount } from '@thorswap-lib/swapkit-entities';
import { AssetAtom, GaiaToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import type { TxParams } from '@thorswap-lib/types';
import { Chain } from '@thorswap-lib/types';

export type SignTransactionTransferParams = {
  amount: Amount;
  to: string;
  from: string;
  memo: string;
};

export const cosmosWalletMethods: any = async function (params: any) {
  try {
    let { sdk, stagenet, api } = params;
    if (!stagenet) stagenet = false;
    const toolbox = GaiaToolbox({ server: api });
    const getAddress = async () =>
      (
        await sdk.address.cosmosGetAddress({
          address_n: addressInfoForCoin(Chain.Cosmos, false).address_n,
        })
      ).address;

    let signTransactionTransfer = async function (params: SignTransactionTransferParams) {
      try {
        console.log('cosmos params', params);
        const { amount, to, from, memo } = params;
        const accountInfo = await toolbox.getAccount(from);

        const body = {
          signDoc: {
            fee: {
              gas: '0',
              amount: [
                {
                  denom: 'uatom',
                  amount: '1000',
                },
              ],
            },
            msgs: [
              {
                value: {
                  amount: [
                    {
                      denom: 'uatom',
                      amount, // todo: decimals are correct?
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
        console.log('cosmos body', body);
        return sdk.cosmos.cosmosSignAmino(body);
      } catch (e) {
        console.error(e);
      }
    };
    const transfer = async ({ asset, amount, recipient, memo }: TxParams) => {
      let from = await getAddress();
      return signTransactionTransfer({
        from,
        to: recipient,
        asset: getDenom(asset || AssetAtom),
        // @ts-ignore
        amount: amount.amount().toString(),
        memo: memo || '',
      });
    };

    return {
      ...toolbox,
      getAddress,
      signTransactionTransfer,
      transfer,
    };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

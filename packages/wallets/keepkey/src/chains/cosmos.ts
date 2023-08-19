import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { AssetAtom, GaiaToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import { Chain, TxParams } from '@thorswap-lib/types';

export const cosmosWalletMethods = async function (params: any) {
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

    let signTransactionTransfer = async function (params: any) {
      try {
        let { amount, to, from, memo } = params;
        let addressInfo = addressInfoForCoin(Chain.Cosmos, false);
        let accountInfo = await toolbox.getAccount(from);

        let msg = {
          addressNList: addressInfo.address_n,
          tx: {
            msg: [
              {
                value: {
                  amount: {
                    denom: 'uatom',
                    amount: amount.toString(),
                  },
                  to_address: to,
                  from_address: from,
                },
                type: 'cosmos-sdk/MsgSend',
              },
            ],
            fee: {
              gas: '0',
              amount: [
                {
                  denom: 'uatom',
                  amount: '1000',
                },
              ],
            },
            memo,
          },
          sequence: accountInfo.sequence,
          accountNumber: accountInfo.accountNumber,
        };

        let input = {
          signDoc: {
            account_number: accountInfo.accountNumber,
            chain_id: 'cosmoshub-4',
            msgs: msg.tx.msg,
            memo: msg.tx.memo ?? '',
            sequence: msg.sequence,
            fee: {
              amount: [
                {
                  amount: '2500',
                  denom: 'uatom',
                },
              ],
              gas: '250000',
            },
          },
          signerAddress: from,
        };
        let responseSign = await sdk.cosmos.cosmosSignAmino(input);
        return responseSign;
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
        amount: amount.amount().toString(),
        memo,
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
  }
};

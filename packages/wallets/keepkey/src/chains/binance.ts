// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { AssetAtom, BinanceToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import type { TxParams } from '@thorswap-lib/types';
import { Chain } from '@thorswap-lib/types';

export const binanceWalletMethods: any = async function (params: any) {
  try {
    let { sdk, stagenet } = params;
    if (!stagenet) stagenet = false;
    const toolbox = BinanceToolbox();

    const getAddress = async () =>
      (
        await sdk.address.binanceGetAddress({
          address_n: addressInfoForCoin(Chain.Binance, false).address_n,
        })
      ).address;

    const signTransactionTransfer = async function (params: any) {
      try {
        let { amount, to, from, memo } = params;
        let addressInfo = addressInfoForCoin(Chain.Binance, false);
        let accountInfo = await toolbox.getAccount(from);

        //Unsigned TX
        let msg = {
          addressNList: addressInfo.address_n,
          tx: {
            msg: [
              {
                inputs: [
                  {
                    address: from,
                    coins: [
                      {
                        amount: amount,
                        denom: 'BNB',
                      },
                    ],
                  },
                ],
                outputs: [
                  {
                    address: to,
                    coins: [
                      {
                        amount: 1000,
                        denom: 'BNB',
                      },
                    ],
                  },
                ],
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
            signatures: [],
            memo,
          },
          sequence: accountInfo.sequence.toString(),
          accountNumber: accountInfo.account_number.toString(),
        };

        let input = {
          signDoc: {
            account_number: accountInfo.account_number.toString(),
            chain_id: 'Binance-Chain-Tigris',
            msgs: msg.tx.msg,
            memo: msg.tx.memo ?? '',
            source: '0',
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
        let responseSign = await sdk.bnb.bnbSignTransaction(input);

        return responseSign;
      } catch (e) {
        console.error(e);
      }
    };

    const transfer = async ({ asset, amount, recipient, memo }: TxParams) => {
      let from = await getAddress();
      return signTransactionTransfer({
        from: from,
        to: recipient,
        asset: getDenom(asset || AssetAtom),
        amount: amount.amount().toString(),
        memo,
      });
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

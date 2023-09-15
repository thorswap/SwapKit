import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { AssetAtom, BinanceToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import type { TxParams } from '@thorswap-lib/types';
import { Chain, ChainId } from '@thorswap-lib/types';
import { KeepKeyParams } from '../keepkey.ts';

type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const binanceWalletMethods: any = async function (params: KeepKeyParams) {
  try {
    const { sdk } = params;
    const toolbox = BinanceToolbox();

    const getAddress = async () =>
      (
        await sdk.address.binanceGetAddress({
          address_n: addressInfoForCoin(Chain.Binance, false).address_n,
        })
      ).address;

    const signTransactionTransfer = async function (params: SignTransactionTransferParams) {
      try {
        const  { amount, to, from, memo } = params;
        const addressInfo = addressInfoForCoin(Chain.Binance, false);
        const accountInfo = await toolbox.getAccount(from);

        const body = {
          signDoc: {
            account_number: accountInfo?.account_number.toString() ?? '0',
            chain_id: ChainId.Binance,
            msgs: [
              {
                outputs: [
                  {
                    address: to,
                    coins: [
                      {
                        denom: Chain.Binance,
                        amount
                      },
                    ],
                  },
                ],
                inputs: [
                  {
                    address: from,
                    coins: [
                      {
                        denom: Chain.Binance,
                        amount
                      },
                    ],
                  },
                ],
              },
            ],
            memo,
            sequence: accountInfo?.sequence.toString() ?? '0',
            source: addressInfo?.source?.toString() ?? '0'
          },
          signerAddress: from
        }

        const keepKeyResponse = await sdk.bnb.bnbSignTransaction(body);

        const broadcastResponse = await toolbox.sendRawTransaction(keepKeyResponse?.serialized, true);
        return broadcastResponse?.[0]?.hash;
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

import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import type { AssetValue } from '@swapkit/helpers';
import { BinanceToolbox } from '@swapkit/toolbox-cosmos';
import type { WalletTxParams } from '@swapkit/types';
import { Chain, ChainId } from '@swapkit/types';

type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

export const binanceWalletMethods: any = async ({ sdk }: { sdk: KeepKeySdk }) => {
  try {
    const toolbox = BinanceToolbox();
    const addressInfo = addressInfoForCoin(Chain.Binance, false);
    const { address: fromAddress } = await sdk.address.thorchainGetAddress({
      address_n: addressInfoForCoin(Chain.THORChain, false).address_n,
    });

    const signTransactionTransfer = async ({
      amount,
      to,
      memo = '',
    }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(fromAddress);

        const keepKeyResponse = await sdk.bnb.bnbSignTransaction({
          signerAddress: fromAddress,
          signDoc: {
            account_number: accountInfo?.account_number.toString() ?? '0',
            chain_id: ChainId.Binance,
            memo,
            sequence: accountInfo?.sequence.toString() ?? '0',
            source: addressInfo?.source?.toString() ?? '0',
            msgs: [
              {
                outputs: [{ address: to, coins: [{ denom: Chain.Binance, amount }] }],
                inputs: [{ address: fromAddress, coins: [{ denom: Chain.Binance, amount }] }],
              },
            ],
          },
        });

        const broadcastResponse = await toolbox.sendRawTransaction(
          keepKeyResponse?.serialized,
          true,
        );
        return broadcastResponse?.[0]?.hash;
      } catch (e) {
        console.error(e);
      }
    };

    const transfer = ({
      assetValue,
      recipient,
      memo,
    }: WalletTxParams & { assetValue: AssetValue }) =>
      signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: assetValue?.symbol,
        amount: assetValue.baseValue.toString(),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

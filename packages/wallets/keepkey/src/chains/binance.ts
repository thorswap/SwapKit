import type { AssetValue } from '@coinmasters/helpers';
import { BinanceToolbox } from '@coinmasters/toolbox-cosmos';
import type { WalletTxParams } from '@coinmasters/types';
import { Chain, ChainId, DerivationPath } from '@coinmasters/types';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';

import { bip32ToAddressNList } from '../helpers/coins.ts';

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

    const { address: fromAddress } = (await sdk.address.binanceGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.Binance]),
    })) as { address: string };

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
            memo: memo || '',
            sequence: accountInfo?.sequence.toString() ?? '0',
            source: '0',
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
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer };
  } catch (e) {
    console.error(e);
    throw e;
  }
};

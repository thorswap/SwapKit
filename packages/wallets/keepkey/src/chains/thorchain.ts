import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import type { AssetValue } from '@swapkit/helpers';
import { derivationPathToString } from '@swapkit/helpers';
import type { DepositParam, TransferParams } from '@swapkit/toolbox-cosmos';
import { ChainId, DerivationPath, RPCUrl } from '@swapkit/types';

import { bip32ToAddressNList } from '../helpers/coins.js';

type SignTransactionParams = {
  assetValue: AssetValue;
  recipient?: string;
  from: string;
  memo: string | undefined;
};

export const thorchainWalletMethods: any = async ({
  sdk,
  derivationPath,
}: {
  sdk: KeepKeySdk;
  derivationPath: any;
}) => {
  const { ThorchainToolbox } = await import('@swapkit/toolbox-cosmos');
  const toolbox = ThorchainToolbox({ stagenet: !'smeshnet' });
  derivationPath = !derivationPath
    ? DerivationPath['THOR']
    : `m/${derivationPathToString(derivationPath)}`;

  const { address: fromAddress } = (await sdk.address.thorchainGetAddress({
    address_n: bip32ToAddressNList(derivationPath),
  })) as { address: string };

  const signTransaction = async ({ assetValue, recipient, from, memo }: SignTransactionParams) => {
    const { getDenomWithChain, makeSignDoc } = await import('@swapkit/toolbox-cosmos');

    const account = await toolbox.getAccount(from);
    if (!account) throw new Error('Account not found');
    if (!account.pubkey) throw new Error('Account pubkey not found');
    const { accountNumber, sequence = 0 } = account;
    const amount = assetValue.getBaseValue('string');

    const isTransfer = recipient && recipient !== '';

    const msg = isTransfer
      ? {
          type: 'thorchain/MsgSend',
          value: {
            amount: [{ amount, denom: assetValue.symbol.toLowerCase() }],
            from_address: from,
            to_address: recipient,
          },
        }
      : {
          type: 'thorchain/MsgDeposit',
          value: {
            coins: [{ amount, asset: getDenomWithChain(assetValue) }],
            memo,
            signer: from,
          },
        };

    const signDoc = makeSignDoc(
      [msg],
      { gas: '500000000', amount: [] },
      ChainId.THORChain,
      memo,
      accountNumber?.toString(),
      sequence,
    );

    const signedTx = isTransfer
      ? await sdk.thorchain.thorchainSignAminoTransfer({
          // TODO can we ignore this ?
          // @ts-expect-error readonly cant be assigned to writable
          signDoc,
          signerAddress: from,
        })
      : await sdk.thorchain.thorchainSignAminoDeposit({
          // @ts-expect-error
          signDoc,
          signerAddress: from,
        });
    const decodedBytes = atob(signedTx.serialized);
    return new Uint8Array(decodedBytes.length).map((_, i) => decodedBytes.charCodeAt(i));
  };

  const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
    try {
      const stargateClient = await StargateClient.connect(RPCUrl.THORChain);
      const signedTransaction = await signTransaction({
        assetValue,
        recipient,
        memo,
        from: fromAddress,
      });
      const broadcastResponse = await stargateClient.broadcastTx(signedTransaction);

      return broadcastResponse.transactionHash;
    } catch (e) {
      // TODO add correct error code
      console.error(e);
      throw e;
    }
  };

  const deposit = async ({ assetValue, memo }: DepositParam) => {
    try {
      const stargateClient = await StargateClient.connect(RPCUrl.THORChain);
      const signedTransaction = await signTransaction({
        assetValue,
        memo,
        from: fromAddress,
      });
      const broadcastResponse = await stargateClient.broadcastTx(signedTransaction);

      return broadcastResponse.transactionHash;
    } catch (e) {
      // TODO add correct error code
      console.error(e);
      throw e;
    }
  };

  return { ...toolbox, getAddress: () => fromAddress, transfer, deposit };
};

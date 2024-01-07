import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk, ThorchainSignAminoDepositRequest } from '@keepkey/keepkey-sdk';
import { derivationPathToString } from '@swapkit/helpers';
import type { DepositParam, TransferParams } from '@swapkit/toolbox-cosmos';
import { ThorchainToolbox } from '@swapkit/toolbox-cosmos';
import { ChainId, DerivationPath, RPCUrl } from '@swapkit/types';

import { bip32ToAddressNList } from '../helpers/coins.ts';

type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

type SignTransactionDepositParams = {
  asset: string;
  amount: any;
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
  try {
    const toolbox = ThorchainToolbox({ stagenet: !'smeshnet' });
    derivationPath = !derivationPath
      ? DerivationPath['THOR']
      : `m/${derivationPathToString(derivationPath)}`;

    const { address: fromAddress } = (await sdk.address.thorchainGetAddress({
      address_n: bip32ToAddressNList(derivationPath),
    })) as { address: string };

    const signTransactionTransfer = async ({
      amount,
      asset,
      to,
      from,
      memo,
    }: SignTransactionTransferParams) => {
      try {
        const accountInfo = await toolbox.getAccount(from);
        const stargateClient = await StargateClient.connect(RPCUrl.THORChain);
        const keepKeyResponse = await sdk.thorchain.thorchainSignAminoTransfer({
          signDoc: {
            account_number: accountInfo?.accountNumber?.toString() ?? '0',
            chain_id: ChainId.THORChain,
            fee: { gas: '500000000', amount: [] },
            msgs: [
              {
                value: {
                  amount: [{ denom: asset.toLowerCase(), amount: amount.toString() }],
                  to_address: to,
                  from_address: from,
                },
                type: 'thorchain/MsgSend' as const,
              },
            ],
            memo: memo || '',
            sequence: accountInfo?.sequence.toString() ?? '0',
          },
          signerAddress: from,
        });

        const decodedBytes = atob(keepKeyResponse.serialized);
        const uint8Array = new Uint8Array(decodedBytes.length);
        for (let i = 0; i < decodedBytes.length; i++) {
          uint8Array[i] = decodedBytes.charCodeAt(i);
        }

        const broadcastResponse = await stargateClient.broadcastTx(uint8Array);

        return broadcastResponse.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) =>
      signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: assetValue.symbol,
        amount: assetValue.getBaseValue('string'),
        memo,
      });

    const signTransactionDeposit = async ({
      amount,
      asset,
      memo = '',
    }: SignTransactionDepositParams) => {
      try {
        const accountInfo = await toolbox.getAccount(fromAddress);

        //new
        let unsigned: ThorchainSignAminoDepositRequest = {
          signDoc: {
            memo: memo || '',
            sequence: accountInfo?.sequence.toString() ?? '0',
            account_number: accountInfo?.accountNumber?.toString() ?? '0',
            chain_id: ChainId.THORChain,
            fee: {
              gas: '500000000',
              amount: null, // thorchain has default fees
            },
            msgs: [
              {
                value: {
                  coins: [{ asset: 'THOR.' + asset.toUpperCase(), amount: amount.toString() }],
                  memo: memo || '',
                  signer: fromAddress,
                },
                type: 'thorchain/MsgDeposit',
              },
            ],
          },
          signerAddress: fromAddress,
        };

        const keepKeyResponse = await sdk.thorchain.thorchainSignAminoDeposit(unsigned);

        const stargateClient = await StargateClient.connect(RPCUrl.THORChain);

        const decodedBytes = atob(keepKeyResponse.serialized);
        const uint8Array = new Uint8Array(decodedBytes.length);
        for (let i = 0; i < decodedBytes.length; i++) {
          uint8Array[i] = decodedBytes.charCodeAt(i);
        }

        const broadcastResponse = await stargateClient.broadcastTx(uint8Array);

        return broadcastResponse.transactionHash;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };

    const deposit = async ({ assetValue, memo }: DepositParam) =>
      signTransactionDeposit({
        memo,
        asset: assetValue.symbol,
        amount: assetValue.getBaseValue('string'),
        from: fromAddress,
      });

    return { ...toolbox, getAddress: () => fromAddress, transfer, deposit };
  } catch (e) {
    throw e;
  }
};

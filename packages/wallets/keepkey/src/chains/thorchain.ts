import { StargateClient } from '@cosmjs/stargate';
import type { KeepKeySdk } from '@keepkey/keepkey-sdk';
import type { DepositParam, TransferParams } from '@coinmasters/toolbox-cosmos';
import { ThorchainToolbox } from '@coinmasters/toolbox-cosmos';
import type {} from '@coinmasters/types';
import { Chain, ChainId, DerivationPath, RPCUrl } from '@coinmasters/types';

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

export const thorchainWalletMethods: any = async ({ sdk }: { sdk: KeepKeySdk }) => {
  try {
    const toolbox = ThorchainToolbox({ stagenet: !'smeshnet' });
    const { address: fromAddress } = (await sdk.address.thorchainGetAddress({
      address_n: bip32ToAddressNList(DerivationPath[Chain.THORChain]),
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
        const addressInfo = addressInfoForCoin(Chain.THORChain, false); // @highlander no witness script here
        const accountInfo = await toolbox.getAccount(fromAddress);

        const keepKeyResponse = await sdk.thorchain.thorchainSignAminoDeposit({
          signerAddress: fromAddress,
          signDoc: {
            memo:memo || '',
            sequence: accountInfo?.sequence.toString() ?? '0',
            source: addressInfo?.source?.toString() ?? '0',
            account_number: accountInfo?.accountNumber?.toString() ?? '0',
            chain_id: ChainId.THORChain,
            fee: { gas: '500000000', amount: [] },
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
        });
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

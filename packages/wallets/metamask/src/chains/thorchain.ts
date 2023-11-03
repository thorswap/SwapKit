// @ts-ignore
import { StargateClient } from '@cosmjs/stargate';
// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { DepositParam, ThorchainToolbox, TransferParams } from '@coinmasters/toolbox-cosmos';
import { Chain, ChainId, RPCUrl } from '@coinmasters/types';

// @ts-ignore
import type { MetaMaskParams } from '../metamask.ts';

type SignTransactionTransferParams = {
  asset: string;
  amount: any;
  to: string;
  from: string;
  memo: string | undefined;
};

// @ts-ignore
export const thorChainWalletMethods: any = async function (params: MetaMaskParams) {
  try {
    const { wallet } = params;
    const toolbox = ThorchainToolbox({ stagenet: !'smeshnet' });

    const getAddress = async () =>
      (
        await wallet.thorchainGetAddress({
        addressNList: addressInfoForCoin(Chain.THORChain, false).address_n,
        })
      );

    const signTransactionTransfer = async (params: SignTransactionTransferParams) => {
      try {
        const { amount, asset, to, from, memo } = params;
        const addressInfo = addressInfoForCoin(Chain.THORChain, false); // @highlander no witness script here
        const accountInfo = await toolbox.getAccount(from);

        const body = {
          signDoc: {
            account_number: accountInfo?.accountNumber?.toString() ?? '0',
            chain_id: ChainId.THORChain,
            fee: {
              gas: '500000000',
              amount: [],
            },
            msgs: [
              {
                value: {
                  amount: [
                    {
                      denom: asset.toLowerCase(),
                      amount: amount.amount().toString(),
                    },
                  ],
                  to_address: to,
                  from_address: from,
                },
                type: 'thorchain/MsgSend',
              },
            ],
            memo,
            sequence: accountInfo?.sequence.toString() ?? '0',
            source: addressInfo?.source?.toString() ?? '0',
          },
          signerAddress: from,
        };

        const [metaMaskResponse, stargateClient] = await Promise.all([
          // @ts-ignore
          wallet.thorchainSignTx(body),
          StargateClient.connect(RPCUrl.THORChain),
        ]);

        const decodedBytes = atob(metaMaskResponse.serialized);
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
        asset: assetValue?.symbol,
        amount: assetValue.baseValue.toString(),
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

        const keepKeyResponse = await wallet.thorchainSignTx({
          signerAddress: fromAddress,
          signDoc: {
            memo,
            sequence: accountInfo?.sequence.toString() ?? '0',
            // FIXME: @highlander - this type is missing from source signature
            // @ts-expect-error
            source: addressInfo?.source?.toString() ?? '0',
            account_number: accountInfo?.accountNumber?.toString() ?? '0',
            chain_id: ChainId.THORChain,
            fee: { gas: '500000000', amount: [{ amount: '2500', denom: 'rune' }] },
            msgs: [
              {
                value: {
                  coins: [{ asset: 'THOR.' + asset.toUpperCase(), amount: amount.toString() }],
                  memo,
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
        amount: assetValue.baseValue.toString(),
        from: fromAddress,
      });

    return {
      ...toolbox,
      getAddress,
      transfer,
      // deposit
    };
  } catch (e) {
    console.error(e);
  }
};

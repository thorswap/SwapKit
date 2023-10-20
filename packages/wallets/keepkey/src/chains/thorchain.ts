// @ts-ignore
import { StargateClient } from '@cosmjs/stargate';
// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { getDenom, ThorchainToolbox } from '@swapkit/toolbox-cosmos';
import type { } from '@swapkit/types';
import { Chain, ChainId, RPCUrl } from '@swapkit/types';
import type { TransferParams } from '@swapkit/toolbox-cosmos';
// @ts-ignore
import type { KeepKeyParams } from '../keepkey.ts';

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

// @ts-ignore
export const thorChainWalletMethods: any = async function (params: KeepKeyParams) {
  try {
    const { sdk } = params;
    const toolbox = ThorchainToolbox({ stagenet: !'smeshnet' });

    const getAddress = async () =>
      (
        await sdk.address.thorchainGetAddress({
          address_n: addressInfoForCoin(Chain.THORChain, false).address_n,
        })
      ).address;

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

        const [keepKeyResponse, stargateClient] = await Promise.all([
          // @ts-ignore
          sdk.thorchain.thorchainSignAminoTransfer(body),
          StargateClient.connect(RPCUrl.THORChain),
        ]);

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

    const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
      let fromAddress = await getAddress();
      return signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: assetValue?.symbol,
        amount:assetValue.baseValue.toString(),
        memo,
      });
    };

    const signTransactionDeposit = async (params: SignTransactionDepositParams) => {
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
              amount: [{
                "amount": "2500",
                "denom": "rune"
              }
              ],
            },
            msgs: [
              {
                value: {
                  coins: [
                    {
                      asset: 'THOR.'+asset.toUpperCase(),
                      amount: amount.toString(),
                    },
                  ],
                  memo,
                  signer:from,
                },
                type: 'thorchain/MsgDeposit',
              },
            ],
            memo,
            sequence: accountInfo?.sequence.toString() ?? '0',
            source: addressInfo?.source?.toString() ?? '0',
          },
          signerAddress: from,
        };
        console.log("body: ",body)
        const [keepKeyResponse, stargateClient] = await Promise.all([
          // @ts-ignore
          sdk.thorchain.thorchainSignAminoDeposit(body),
          StargateClient.connect(RPCUrl.THORChain),
        ]);

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

    const deposit = async (params: any) => {
      console.log("params", params)
      const { assetValue, amount, memo } = params;
      let fromAddress = await getAddress();
      let paramsDeposit = { asset:assetValue.symbol, amount:assetValue.baseValue.toString(), memo, from: fromAddress }
      console.log("paramsDeposit: ",paramsDeposit)
      return signTransactionDeposit(paramsDeposit);
    }

    return {
      ...toolbox,
      getAddress,
      transfer,
      deposit
    };
  } catch (e) {
    console.error(e);
  }
};

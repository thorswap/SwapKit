// @ts-ignore
import { StargateClient } from '@cosmjs/stargate';
// @ts-ignore
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
import { AssetRuneNative, getDenom, ThorchainToolbox } from '@thorswap-lib/toolbox-cosmos';
import type { TxParams } from '@thorswap-lib/types';
import { Chain, ChainId, RPCUrl } from '@thorswap-lib/types';

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

        const [metaMaskResponse, stargateClient] = await Promise.all([
          // @ts-ignore
          wallet.thorchainSignAminoTransfer(body),
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

    const transfer = async ({ asset = AssetRuneNative, amount, recipient, memo }: TxParams) => {
      let fromAddress = await getAddress();
      return signTransactionTransfer({
        from: fromAddress,
        to: recipient,
        asset: getDenom(asset || AssetRuneNative),
        amount,
        memo,
      });
    };

    // const deposit = async ({ asset = AssetRuneNative, amount, memo }: DepositParam) => {
    //   let fromAddress = await getAddress();
    //   return signTransactionDeposit({ asset, amount, memo, from: fromAddress });
    // }

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

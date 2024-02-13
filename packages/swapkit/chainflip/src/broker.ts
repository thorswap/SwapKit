import type { AssetValue } from '@swapkit/helpers';
import type { ETHToolbox } from '@swapkit/toolbox-evm';
import type { ChainflipToolbox } from '@swapkit/toolbox-substrate';

import { chainflipGateway } from './chainflipGatewayABI.ts';

const registerAsBroker = async (
  toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  address: string,
) => {
  const extrinsic = toolbox.api.tx.swapping.registerAsBroker(address);
  return toolbox.signAndBroadcast(extrinsic);
};

const requestSwapDepositAddress = async (
  toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  {
    sellAsset,
    buyAsset,
    recipient,
    brokerCommissionBPS,
  }: {
    sellAsset: AssetValue;
    buyAsset: AssetValue;
    recipient: string;
    brokerCommissionBPS: number;
  },
) => {
  const { SwapKitNumber } = await import('@swapkit/helpers');

  return new Promise<{
    depositChannelId: string;
    depositAddress: string;
    srcChainExpiryBlock: number;
    sellAsset: AssetValue;
    buyAsset: AssetValue;
    recipient: string;
    brokerCommissionBPS: number;
  }>((resolve) => {
    toolbox.signAndBroadcast(
      toolbox.api.tx.swapping.requestSwapDepositAddress({
        sourceAsset: sellAsset.ticker,
        destinationAsset: buyAsset.ticker,
        destinationAddress: recipient,
        brokerCommissionBPS: SwapKitNumber.fromBigInt(BigInt(brokerCommissionBPS)).getBaseValue(
          'number',
        ),
      }),
      // TODO - fix this type - CF extrinsic return value does not align with polkadot typing
      (result: any) => {
        resolve({
          depositChannelId: `${result.issuedBlock}-${sellAsset.ticker}-${result.channelId}`,
          depositAddress: result.address,
          srcChainExpiryBlock: result.sourceChainExpiryBlock,
          sellAsset,
          buyAsset,
          recipient,
          brokerCommissionBPS,
        });
      },
    );
  });
};

const fundStateChainAccount = async (
  evmToolbox: ReturnType<typeof ETHToolbox>,
  chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  stateChainAccount: string,
  amount: AssetValue,
) => {
  const { decodeAddress } = await import('@polkadot/keyring');
  const { isHex, u8aToHex } = await import('@polkadot/util');

  if (amount.symbol !== 'FLIP') {
    throw new Error('Only FLIP is supported');
  }

  if (!chainflipToolbox.validateAddress(stateChainAccount)) {
    throw new Error('Invalid address');
  }

  const hexAddress = isHex(stateChainAccount)
    ? stateChainAccount
    : u8aToHex(decodeAddress(stateChainAccount));

  return evmToolbox.call({
    abi: chainflipGateway,
    contractAddress: '0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd',
    funcName: 'fundStateChainAccount',
    funcParams: [hexAddress, amount],
  });
};

export const ChainflipBroker = async (
  chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
) => ({
  registerAsBroker: async (address: string) => registerAsBroker(chainflipToolbox, address),
  requestSwapDepositAddress: async (chainflipTransaction: {
    sellAsset: AssetValue;
    buyAsset: AssetValue;
    recipient: string;
    brokerCommissionBPS: number;
  }) => requestSwapDepositAddress(chainflipToolbox, chainflipTransaction),
  fundStateChainAccount: async (
    stateChainAccount: string,
    amount: AssetValue,
    evmToolbox: ReturnType<typeof ETHToolbox>,
  ) => fundStateChainAccount(evmToolbox, chainflipToolbox, stateChainAccount, amount),
});

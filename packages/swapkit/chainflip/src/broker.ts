import { Chains } from "@chainflip/sdk/swap";
import { type AssetValue, SwapKitError } from "@swapkit/helpers";
import type { ETHToolbox } from "@swapkit/toolbox-evm";
import type { ChainflipToolbox } from "@swapkit/toolbox-substrate";
import { Chain } from "@swapkit/types";

import { chainflipGateway } from "./chainflipGatewayABI.ts";

const chainToChainflipChain = new Map<Chain, keyof typeof Chains>([
  [Chain.Ethereum, Chains.Ethereum],
  [Chain.Bitcoin, Chains.Bitcoin],
  [Chain.Polkadot, Chains.Polkadot],
]);

const registerAsBroker = (
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
  const { SwapKitNumber } = await import("@swapkit/helpers");

  const isBuyChainPolkadot = buyAsset.chain === Chain.Polkadot;

  let recipientAddress: string;
  try {
    recipientAddress = isBuyChainPolkadot
      ? await toolbox.encodeAddress(await toolbox.decodeAddress(recipient), "hex")
      : recipient;
  } catch (error) {
    throw new SwapKitError("chainflip_broker_recipient_error", error);
  }

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
      toolbox.api.tx.swapping.requestSwapDepositAddress(
        sellAsset.ticker.toLowerCase(),
        buyAsset.ticker.toLowerCase(),
        { [buyAsset.chain.toLowerCase()]: recipientAddress },
        SwapKitNumber.fromBigInt(BigInt(brokerCommissionBPS)).getBaseValue("number"),
        null,
      ),
      async (result: any) => {
        if (!result.status?.isFinalized) return;

        const {
          event: {
            data: { depositAddress, sourceChainExpiryBlock, destinationAddress, channelId },
          },
        } = result.events[0].toHuman();

        const header = await toolbox.api.rpc.chain.getHeader(result.status.toJSON().finalized);

        resolve({
          depositChannelId: `${header.number}-${chainToChainflipChain.get(
            sellAsset.chain,
          )}-${channelId}`,
          depositAddress: Object.values(depositAddress)[0] as string,
          srcChainExpiryBlock: Number((sourceChainExpiryBlock as string).replace(",", "")),
          sellAsset,
          buyAsset,
          recipient: Object.values(destinationAddress)[0] as string,
          brokerCommissionBPS,
        });
      },
    );
  });
};

const withdrawFee = async (
  toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  {
    feeAsset,
    recipient,
  }: {
    feeAsset: AssetValue;
    recipient: string;
  },
) => {
  const isFeeChainPolkadot = feeAsset.chain === Chain.Polkadot;

  let recipientAddress: string;
  try {
    recipientAddress = isFeeChainPolkadot
      ? await toolbox.encodeAddress(await toolbox.decodeAddress(recipient), "hex")
      : recipient;
  } catch (error) {
    throw new SwapKitError("chainflip_broker_recipient_error", error);
  }

  const extrinsic = toolbox.api.tx.swapping.withdraw(feeAsset.ticker.toLowerCase(), {
    [feeAsset.chain.toLowerCase()]: recipientAddress,
  });

  return toolbox.signAndBroadcast(extrinsic);
};

const fundStateChainAccount = async (
  evmToolbox: ReturnType<typeof ETHToolbox>,
  chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  stateChainAccount: string,
  amount: AssetValue,
) => {
  const { decodeAddress } = await import("@polkadot/keyring");
  const { isHex, u8aToHex } = await import("@polkadot/util");

  if (amount.symbol !== "FLIP") {
    throw new Error("Only FLIP is supported");
  }

  if (!chainflipToolbox.validateAddress(stateChainAccount)) {
    throw new Error("Invalid address");
  }

  const hexAddress = isHex(stateChainAccount)
    ? stateChainAccount
    : u8aToHex(decodeAddress(stateChainAccount));

  return evmToolbox.call({
    abi: chainflipGateway,
    contractAddress: "0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd",
    funcName: "fundStateChainAccount",
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
  withdrawFee: async ({ feeAsset, recipient }: { feeAsset: AssetValue; recipient: string }) =>
    withdrawFee(chainflipToolbox, { feeAsset, recipient }),
});

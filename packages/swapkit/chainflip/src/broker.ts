import { Chains } from "@chainflip/sdk/swap";
import {
  AssetValue,
  type GenericSwapParams,
  SwapKitError,
  SwapKitNumber,
  wrapWithThrow,
} from "@swapkit/helpers";
import { Chain } from "@swapkit/helpers";
import type { ETHToolbox } from "@swapkit/toolbox-evm";
import type { ChainflipToolbox } from "@swapkit/toolbox-substrate";

import { decodeAddress } from "@polkadot/keyring";
import { isHex, u8aToHex } from "@polkadot/util";
import { chainflipGateway } from "./chainflipGatewayABI.ts";
import type { SwapDepositResponse, WithdrawFeeResponse } from "./types.ts";

const chainToChainflipChain = new Map<Chain, keyof typeof Chains>([
  [Chain.Ethereum, Chains.Ethereum],
  [Chain.Bitcoin, Chains.Bitcoin],
  [Chain.Polkadot, Chains.Polkadot],
]);

const registerAsBroker = (
  toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  address: string,
) => {
  const extrinsic = toolbox.api.tx.swapping?.registerAsBroker?.(address);

  if (!extrinsic) {
    throw new Error("chainflip_broker_register");
  }

  return toolbox.signAndBroadcast(extrinsic);
};

const requestSwapDepositAddress = async (
  toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  {
    route,
    sellAsset,
    buyAsset,
    recipient,
    brokerCommissionBPS,
  }: GenericSwapParams & { brokerCommissionBPS: number },
) => {
  const routeSellAsset = AssetValue.fromStringSync(route.sellAsset);
  const routeBuyAsset = AssetValue.fromStringSync(route.buyAsset);

  const isBuyChainPolkadot =
    buyAsset?.chain === Chain.Polkadot || routeBuyAsset.chain === Chain.Polkadot;

  const recipientAddress = wrapWithThrow(() => {
    return isBuyChainPolkadot
      ? toolbox.encodeAddress(toolbox.decodeAddress(recipient || route.destinationAddress), "hex")
      : recipient || route.destinationAddress;
  }, "chainflip_broker_recipient_error");

  return new Promise<SwapDepositResponse>((resolve) => {
    const tx = toolbox.api.tx.swapping?.requestSwapDepositAddress?.(
      (sellAsset || routeSellAsset).ticker.toLowerCase(),
      (buyAsset || routeBuyAsset).ticker.toLowerCase(),
      { [(buyAsset || routeBuyAsset).chain.toLowerCase()]: recipientAddress },
      SwapKitNumber.fromBigInt(BigInt(brokerCommissionBPS)).getBaseValue("number"),
      null,
      0,
    );

    if (!tx) {
      throw new Error("chainflip_broker_tx_error");
    }

    toolbox.signAndBroadcast(tx, async (result) => {
      if (!result.status?.isFinalized) {
        return;
      }

      const depositChannelEvent = result.events.find(
        (event) => event.event.method === "SwapDepositAddressReady",
      );

      if (!depositChannelEvent) {
        throw new SwapKitError(
          "chainflip_channel_error",
          "Could not find 'SwapDepositAddressReady' event",
        );
      }

      const {
        event: {
          data: { depositAddress, sourceChainExpiryBlock, destinationAddress, channelId },
        },
      } = depositChannelEvent.toHuman() as Todo;

      const hash = result.status?.toJSON?.() as { finalized: string };
      const header = await toolbox.api.rpc.chain.getHeader(hash?.finalized);
      const depositChannelId = `${header.number}-${chainToChainflipChain.get(
        (sellAsset || routeSellAsset).chain,
      )}-${channelId.replaceAll(",", "")}`;

      resolve({
        brokerCommissionBPS,
        buyAsset: buyAsset || routeBuyAsset,
        depositAddress: Object.values(depositAddress)[0] as string,
        depositChannelId,
        recipient: Object.values(destinationAddress)[0] as string,
        sellAsset: sellAsset || routeSellAsset,
        srcChainExpiryBlock: Number((sourceChainExpiryBlock as string).replaceAll(",", "")),
      });
    });
  });
};

const withdrawFee = (
  toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  { feeAsset, recipient }: { feeAsset: AssetValue; recipient: string },
) => {
  const isFeeChainPolkadot = feeAsset.chain === Chain.Polkadot;

  const recipientAddress = wrapWithThrow(() => {
    return isFeeChainPolkadot
      ? toolbox.encodeAddress(toolbox.decodeAddress(recipient), "hex")
      : recipient;
  }, "chainflip_broker_recipient_error");

  return new Promise<WithdrawFeeResponse>((resolve) => {
    const extrinsic = toolbox.api.tx?.swapping?.withdraw?.(feeAsset.ticker.toLowerCase(), {
      [feeAsset.chain.toLowerCase()]: recipientAddress,
    });

    if (!extrinsic) {
      throw new Error("chainflip_broker_withdraw");
    }

    toolbox.signAndBroadcast(extrinsic, async (result) => {
      if (!result.status?.isFinalized) {
        return;
      }

      const withdrawEvent = result.events.find(
        (event) => event.event.method === "WithdrawalRequested",
      );

      if (!withdrawEvent) {
        throw new SwapKitError(
          "chainflip_channel_error",
          "Could not find 'WithdrawalRequested' event",
        );
      }

      const {
        event: {
          data: { egressId, egressAsset, egressAmount, egressFee, destinationAddress },
        },
      } = withdrawEvent.toHuman() as Todo;

      resolve({
        egressId,
        egressAsset,
        egressAmount,
        egressFee,
        destinationAddress,
      });
    });
  });
};

const fundStateChainAccount = (
  evmToolbox: ReturnType<typeof ETHToolbox>,
  chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
  stateChainAccount: string,
  amount: AssetValue,
) => {
  if (amount.symbol !== "FLIP") {
    throw new Error("Only FLIP is supported");
  }

  if (!chainflipToolbox.validateAddress(stateChainAccount)) {
    throw new Error("Invalid address");
  }

  const hexAddress = isHex(stateChainAccount)
    ? stateChainAccount
    : u8aToHex(decodeAddress(stateChainAccount));

  return evmToolbox.call<string>({
    abi: chainflipGateway,
    contractAddress: "0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd",
    funcName: "fundStateChainAccount",
    funcParams: [hexAddress, amount],
  });
};

export const ChainflipBroker = (
  chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
) => ({
  registerAsBroker: (address: string) => registerAsBroker(chainflipToolbox, address),
  requestSwapDepositAddress: (
    chainflipTransaction: GenericSwapParams & { brokerCommissionBPS: number },
  ) => requestSwapDepositAddress(chainflipToolbox, chainflipTransaction),
  fundStateChainAccount: (
    stateChainAccount: string,
    amount: AssetValue,
    evmToolbox: ReturnType<typeof ETHToolbox>,
  ) => fundStateChainAccount(evmToolbox, chainflipToolbox, stateChainAccount, amount),
  withdrawFee: (params: { feeAsset: AssetValue; recipient: string }) =>
    withdrawFee(chainflipToolbox, params),
});

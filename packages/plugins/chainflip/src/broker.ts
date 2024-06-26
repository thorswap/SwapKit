import { Chains } from "@chainflip/sdk/swap";
import { AssetValue, SwapKitError, SwapKitNumber, wrapWithThrow } from "@swapkit/helpers";
import { Chain } from "@swapkit/helpers";
import type { ETHToolbox } from "@swapkit/toolbox-evm";
import type { ChainflipToolbox } from "@swapkit/toolbox-substrate";

import { decodeAddress } from "@polkadot/keyring";
import { isHex, u8aToHex } from "@polkadot/util";
import { toCFTicker } from "./assets.ts";
import { chainflipGateway } from "./chainflipGatewayABI.ts";
import type {
  RequestSwapDepositAddressParams,
  SwapDepositResponse,
  WithdrawFeeResponse,
} from "./types.ts";

const chainToChainflipChain = new Map<Chain, keyof typeof Chains>([
  [Chain.Arbitrum, Chains.Arbitrum],
  [Chain.Bitcoin, Chains.Bitcoin],
  [Chain.Ethereum, Chains.Ethereum],
  [Chain.Polkadot, Chains.Polkadot],
]);

const registerAsBroker =
  (toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>) => (address: string) => {
    const extrinsic = toolbox.api.tx.swapping?.registerAsBroker?.(address);

    if (!extrinsic) {
      throw new Error("chainflip_broker_register");
    }

    return toolbox.signAndBroadcast(extrinsic);
  };

const requestSwapDepositAddress =
  (toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>) =>
  async ({
    route,
    sellAsset,
    buyAsset,
    recipient: _recipient,
    brokerCommissionBPS = 0,
    ccmMetadata,
    maxBoostFeeBps,
  }: RequestSwapDepositAddressParams) => {
    const sellAssetValue = sellAsset || (route && AssetValue.fromStringSync(route.sellAsset));
    const buyAssetValue = buyAsset || (route && AssetValue.fromStringSync(route.buyAsset));
    const recipient = _recipient || route?.destinationAddress;

    if (!(sellAssetValue && buyAssetValue && recipient)) throw new Error("Invalid params");

    const isBuyChainPolkadot =
      buyAsset?.chain === Chain.Polkadot || buyAssetValue.chain === Chain.Polkadot;

    const _ccmMetadata = ccmMetadata ?? null;
    const _maxBoostFeeBps = maxBoostFeeBps ?? 0;

    const recipientAddress = wrapWithThrow(() => {
      return isBuyChainPolkadot
        ? toolbox.encodeAddress(toolbox.decodeAddress(recipient), "hex")
        : recipient;
    }, "chainflip_broker_recipient_error");

    return new Promise<SwapDepositResponse>((resolve) => {
      const tx = toolbox.api.tx.swapping?.requestSwapDepositAddress?.(
        toCFTicker(sellAssetValue),
        toCFTicker(buyAssetValue),
        { [buyAssetValue.chain.toLowerCase()]: recipientAddress },
        SwapKitNumber.fromBigInt(BigInt(brokerCommissionBPS)).getBaseValue("number"),
        _ccmMetadata,
        _maxBoostFeeBps,
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
          sellAssetValue.chain,
        )}-${channelId.replaceAll(",", "")}`;

        resolve({
          brokerCommissionBPS,
          buyAsset: buyAssetValue,
          depositAddress: Object.values(depositAddress)[0] as string,
          depositChannelId,
          recipient: Object.values(destinationAddress)[0] as string,
          sellAsset: sellAssetValue,
          srcChainExpiryBlock: Number((sourceChainExpiryBlock as string).replaceAll(",", "")),
        });
      });
    });
  };

const withdrawFee =
  (toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>) =>
  ({ feeAsset, recipient }: { feeAsset: AssetValue; recipient: string }) => {
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

const fundStateChainAccount =
  (chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>) =>
  ({
    evmToolbox,
    stateChainAccount,
    amount,
  }: {
    evmToolbox: ReturnType<typeof ETHToolbox>;
    stateChainAccount: string;
    amount: AssetValue;
  }) => {
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
  registerAsBroker: registerAsBroker(chainflipToolbox),
  requestSwapDepositAddress: requestSwapDepositAddress(chainflipToolbox),
  fundStateChainAccount: fundStateChainAccount(chainflipToolbox),
  withdrawFee: withdrawFee(chainflipToolbox),
});

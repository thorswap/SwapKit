import { Assets, Chains } from "@chainflip/sdk/swap";
import { AssetValue, SwapKitError, SwapKitNumber, wrapWithThrow } from "@swapkit/helpers";
import { Chain } from "@swapkit/helpers";
import type { ETHToolbox } from "@swapkit/toolbox-evm";
import type { ChainflipToolbox } from "@swapkit/toolbox-substrate";
import bs58 from "bs58";

import { decodeAddress } from "@polkadot/keyring";
import { isHex, u8aToHex } from "@polkadot/util";
import { toCFTicker } from "./assets";
import { chainflipGateway } from "./chainflipGatewayABI";
import type {
  RequestSwapDepositAddressParams,
  SwapDepositResponse,
  WithdrawFeeResponse,
} from "./types";

export const chainToChainflipChain = new Map<Chain, keyof typeof Chains>([
  [Chain.Arbitrum, Chains.Arbitrum],
  [Chain.Bitcoin, Chains.Bitcoin],
  [Chain.Ethereum, Chains.Ethereum],
  [Chain.Polkadot, Chains.Polkadot],
  [Chain.Solana, Chains.Solana],
  [Chain.Polkadot, Chains.Polkadot],
]);

export const assetTickerToChainflipAsset = new Map<string, keyof typeof Assets>([
  ["FLIP", Assets.FLIP],
  ["BTC", Assets.BTC],
  ["ETH", Assets.ETH],
  ["USDC", Assets.USDC],
  ["USDT", Assets.USDT],
  ["DOT", Assets.DOT],
  ["SOL", Assets.SOL],
]);

export const assetIdentifierToChainflipTicker = new Map<string, string>([
  ["ARB.ETH", "ArbEth"],
  ["ARB.USDC-0XAF88D065E77C8CC2239327C5EDB3A432268E5831", "ArbUsdc"],
  ["BTC.BTC", "Btc"],
  ["DOT.DOT", "Dot"],
  ["ETH.ETH", "Eth"],
  ["ETH.FLIP-0X826180541412D574CF1336D22C0C0A287822678A", "Flip"],
  ["ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48", "Usdc"],
  ["ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7", "Usdt"],
  ["SOL.SOL", "Sol"],
  ["SOL.USDC-EPJFWDD5AUFQSSQEM2QN1XZYBAPC8G4WEGGKZWYTDT1V", "SolUsdc"],
]);

const decodeChainflipAddress = (address: string, chain: Chain) => {
  switch (chain) {
    case Chain.Solana:
      return bs58.encode(new Uint8Array(Buffer.from(address.replace("0x", ""), "hex")));
    default:
      return address;
  }
};

const encodeChainflipAddress =
  (toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>) => (address: string, chain: Chain) => {
    switch (chain) {
      case Chain.Solana:
        return toolbox.encodeAddress(bs58.decode(address), "hex");
      case Chain.Polkadot:
        return toolbox.encodeAddress(toolbox.decodeAddress(address), "hex");
      default:
        return address;
    }
  };

const registerAsBroker =
  (toolbox: Awaited<ReturnType<typeof ChainflipToolbox>>) => () => {
    const extrinsic = toolbox.api.tx.swapping?.registerAsBroker?.();

    if (!extrinsic) {
      throw new SwapKitError("chainflip_broker_register");
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
    ccmMetadata = null,
    maxBoostFeeBps = 0,
  }: RequestSwapDepositAddressParams) => {
    const sellAssetValue = sellAsset || (route && AssetValue.from({ asset: route.sellAsset }));
    const buyAssetValue = buyAsset || (route && AssetValue.from({ asset: route.buyAsset }));
    const recipient = _recipient || route?.destinationAddress;

    if (!(sellAssetValue && buyAssetValue && recipient)) {
      throw new SwapKitError("chainflip_broker_invalid_params");
    }

    const recipientAddress = wrapWithThrow(() => {
      return encodeChainflipAddress(toolbox)(recipient, buyAsset?.chain || buyAssetValue.chain);
    }, "chainflip_broker_recipient_error");

    return new Promise<SwapDepositResponse>((resolve) => {
      const tx = toolbox.api.tx.swapping?.requestSwapDepositAddress?.(
        toCFTicker(sellAssetValue),
        toCFTicker(buyAssetValue),
        { [buyAssetValue.chain.toLowerCase()]: recipientAddress },
        SwapKitNumber.fromBigInt(BigInt(brokerCommissionBPS)).getBaseValue("number"),
        ccmMetadata,
        maxBoostFeeBps,
      );

      if (!tx) {
        throw new SwapKitError("chainflip_broker_tx_error");
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
            data: {
              depositAddress: depositAddressRaw,
              sourceChainExpiryBlock,
              destinationAddress,
              channelId,
            },
          },
        } = depositChannelEvent.toHuman() as any;

        const hash = result.status?.toJSON?.() as { finalized: string };
        const header = await toolbox.api.rpc.chain.getHeader(hash?.finalized);
        const depositChannelId = `${header.number}-${chainToChainflipChain.get(
          sellAssetValue.chain,
        )}-${channelId.replaceAll(",", "")}`;

        const depositAddress = decodeChainflipAddress(
          Object.values(depositAddressRaw)[0] as string,
          sellAssetValue.chain,
        );

        resolve({
          brokerCommissionBPS,
          buyAsset: buyAssetValue,
          depositAddress,
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
        throw new SwapKitError("chainflip_broker_withdraw");
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
        } = withdrawEvent.toHuman() as any;

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
    assetValue,
    fromAddress
  }: {
    evmToolbox: ReturnType<typeof ETHToolbox>;
    stateChainAccount: string;
    assetValue: AssetValue;
    fromAddress: string;
  }) => {
    if (assetValue.symbol !== "ETH.FLIP-0x826180541412D574cf1336d22c0C0a287822678A") {
      throw new SwapKitError("chainflip_broker_fund_only_flip_supported");
    }

    if (!chainflipToolbox.validateAddress(stateChainAccount)) {
      throw new SwapKitError("chainflip_broker_fund_invalid_address");
    }

    const hexAddress = isHex(stateChainAccount)
      ? stateChainAccount
      : u8aToHex(decodeAddress(stateChainAccount));

    return evmToolbox.call<string>({
      abi: chainflipGateway,
      contractAddress: "0x6995ab7c4d7f4b03f467cf4c8e920427d9621dbd",
      funcName: "fundStateChainAccount",
      funcParams: [hexAddress, assetValue.getBaseValue("string")],
      txOverrides: { from: fromAddress },
    });
  };

export const ChainflipBroker = (
  chainflipToolbox: Awaited<ReturnType<typeof ChainflipToolbox>>,
) => ({
  registerAsBroker: registerAsBroker(chainflipToolbox),
  requestSwapDepositAddress: requestSwapDepositAddress(chainflipToolbox),
  fundStateChainAccount: fundStateChainAccount(chainflipToolbox),
  withdrawFee: withdrawFee(chainflipToolbox),
  decodeChainflipAddress,
});

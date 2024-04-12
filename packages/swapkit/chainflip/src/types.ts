import type { AssetValue } from "@swapkit/helpers";

export type WithdrawFeeResponse = {
  egressId: string;
  egressAsset: string;
  egressAmount: string;
  egressFee: string;
  destinationAddress: string;
};

export type SwapDepositResponse = {
  depositChannelId: string;
  depositAddress: string;
  srcChainExpiryBlock: number;
  sellAsset: AssetValue;
  buyAsset: AssetValue;
  recipient: string;
  brokerCommissionBPS: number;
};

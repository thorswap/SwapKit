import type { AssetValue } from "../modules/assetValue";

export type GenericSwapParams = {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
};

export type SwapParams<PluginNames extends string, T = GenericSwapParams> = T & {
  pluginName: PluginNames;
};

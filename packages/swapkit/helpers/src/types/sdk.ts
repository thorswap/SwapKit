import type { AssetValue } from "../modules/assetValue";

export type GenericSwapParams = {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
};

export type SwapParams<PluginNames = string, T = GenericSwapParams> = T & {
  pluginName: PluginNames;
};

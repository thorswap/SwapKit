import type { AssetValue } from "../modules/assetValue";

export type PluginName = "thorchain" | "chainflip" | "mayachain";

export type ProviderMethods = {
  swap: (swapParams: SwapParams) => Promise<string>;
  [key: string]: Todo;
};

export type SwapKitPlugins = {
  [K in PluginName]?: ProviderMethods;
};

type GenericSwapParams = {
  buyAsset: AssetValue;
  sellAsset: AssetValue;
  recipient: string;
};

export type SwapParams<T = GenericSwapParams> = T & {
  provider?: {
    name: PluginName;
    config: Record<string, Todo>;
  };
};

export type AvailableProviders<T> = T | { [K in PluginName]?: ProviderMethods };

export type SwapKitPlugin = <T>({ wallets, stagenet }: { wallets: T; stagenet?: boolean }) => {
  name: PluginName;
  methods: ProviderMethods;
};

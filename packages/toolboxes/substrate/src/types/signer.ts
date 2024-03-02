import type { Signer } from "@polkadot/types/types";

export type SwapKitSubstrateSigner = Signer & {
  address: string;
};

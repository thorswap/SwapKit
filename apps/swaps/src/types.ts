import type { SwapKitCore } from '@coinmasters/core';

export type WalletDataType = Awaited<
  ReturnType<InstanceType<typeof SwapKitCore>['getWalletByChain']>
>;

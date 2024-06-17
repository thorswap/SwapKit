import type { SwapKitCore } from '@swapkit/core';

export type WalletDataType = Awaited<
  ReturnType<InstanceType<typeof SwapKitCore>['getWalletByChain']>
>;

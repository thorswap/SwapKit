import { SwapKitCore } from '@thorswap-lib/swapkit-core';

export type WalletDataType = Awaited<
  ReturnType<InstanceType<typeof SwapKitCore>['getWalletByChain']>
>;

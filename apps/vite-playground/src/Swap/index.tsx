import type { QuoteRoute } from '@thorswap-lib/swapkit-api';
import type { AssetValue, SwapKitCore } from '@thorswap-lib/swapkit-core';
import { FeeOption } from '@thorswap-lib/types';
import { useCallback } from 'react';

import { SwapInputs } from './SwapInputs';

export default function Swap({
  inputAsset,
  outputAsset,
  skClient,
}: {
  inputAsset?: AssetValue;
  outputAsset?: AssetValue;
  skClient?: SwapKitCore;
}) {
  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = inputAsset?.chain;
      const outputChain = outputAsset?.chain;
      if (!outputChain || !inputChain || !skClient) return;

      const address = skClient.getAddress(outputChain);

      const txHash = await skClient.swap({
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(skClient.getExplorerTxUrl(inputChain, txHash as string), '_blank');
    },
    [inputAsset, outputAsset?.chain, skClient],
  );

  return (
    <>
      <h4>Swap</h4>
      <SwapInputs
        handleSwap={handleSwap}
        inputAsset={inputAsset}
        outputAsset={outputAsset}
        skClient={skClient}
      />
    </>
  );
}

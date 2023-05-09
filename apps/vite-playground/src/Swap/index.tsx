import { QuoteRoute } from '@thorswap-lib/swapkit-api';
import { AssetAmount } from '@thorswap-lib/swapkit-core';
import { FeeOption } from '@thorswap-lib/types';
import { useCallback } from 'react';

import { getSwapKitClient } from '../swapKitClient';

import { SwapInputs } from './SwapInputs';

export default function Swap({
  inputAsset,
  outputAsset,
  stagenet,
}: {
  inputAsset?: AssetAmount;
  outputAsset?: AssetAmount;
  stagenet: boolean;
}) {
  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = inputAsset?.asset.L1Chain;
      const outputChain = outputAsset?.asset.L1Chain;
      if (!outputChain || !inputChain) return;

      const skClient = getSwapKitClient(stagenet);
      const address = skClient.getAddress(outputChain);

      const txHash = await skClient.swap({
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(skClient.getExplorerTxUrl(inputChain, txHash as string), '_blank');
    },
    [inputAsset?.asset.L1Chain, outputAsset?.asset.L1Chain, stagenet],
  );

  return (
    <>
      <h4>Swap</h4>
      <SwapInputs
        handleSwap={handleSwap}
        inputAsset={inputAsset}
        outputAsset={outputAsset}
        stagenet={stagenet}
      />
    </>
  );
}

import { QuoteRoute } from '@thorswap-lib/swapkit-api';
import { AssetAmount } from '@thorswap-lib/swapkit-core';
import { FeeOption } from '@thorswap-lib/types';
import { useCallback } from 'react';

import { getSwapKitClient } from '../swapKitClient';

import { SwapInputs } from './SwapInputs';

export default function Swap({
  inputAsset,
  outputAsset,
}: {
  inputAsset?: AssetAmount;
  outputAsset?: AssetAmount;
}) {
  const handleSwap = useCallback(
    async (route: QuoteRoute) => {
      const inputChain = inputAsset?.asset.L1Chain;
      const outputChain = outputAsset?.asset.L1Chain;
      if (!outputChain || !inputChain) return;

      const skClient = getSwapKitClient();
      const address = skClient.getAddress(outputChain);

      const txHash = await getSwapKitClient().swap({
        // @ts-expect-error
        route,
        recipient: address,
        feeOptionKey: FeeOption.Fast,
      });

      window.open(skClient.getExplorerTxUrl(inputChain, txHash as string), '_blank');
    },
    [inputAsset?.asset.L1Chain, outputAsset?.asset.L1Chain],
  );

  return (
    <>
      <h4>Swap</h4>
      <SwapInputs handleSwap={handleSwap} inputAsset={inputAsset} outputAsset={outputAsset} />
    </>
  );
}

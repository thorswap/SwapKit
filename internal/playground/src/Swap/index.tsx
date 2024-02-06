import type { AssetValue, SwapKitCore } from '@swapkit/core';
import { ChainflipBroker } from '@swapkit/chainflip';
import type { QuoteRoute } from '@swapkit/helpers';
import { FeeOption } from '@swapkit/types';
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

  const handleRegisterBroker = useCallback(async () => {
    const cftb = skClient.connectedWallets.FLIP;
    const ethtb = skClient.connectedWallets.ETH;

    const broker = await ChainflipBroker(cftb, ethtb);
    const res = await broker.registerAsBroker(cftb.getAddress());
  }, [skClient]);

  return (
    <>
      <h4>Swap</h4>
      <SwapInputs
        handleSwap={handleSwap}
        inputAsset={inputAsset}
        outputAsset={outputAsset}
        skClient={skClient}
      />
      <button onClick={handleRegisterBroker}>Register Broker</button>
    </>
  );
}

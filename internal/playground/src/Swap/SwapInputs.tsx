import type { QuoteRoute } from '@swapkit/api';
import { SwapKitApi } from '@swapkit/api';
import type { AssetValue, SwapKitCore } from '@swapkit/core';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  inputAsset?: AssetValue;
  outputAsset?: AssetValue;
  handleSwap: (route: QuoteRoute) => Promise<void>;
  skClient?: SwapKitCore;
};

export const SwapInputs = ({ skClient, inputAsset, outputAsset, handleSwap }: Props) => {
  const [loading, setLoading] = useState(false);
  const [inputAssetValue, setInput] = useState<AssetValue | undefined>();
  const [routes, setRoutes] = useState<QuoteRoute[]>([]);

  const setAmount = useCallback(
    (amountValue: string) => {
      if (!inputAsset) return;

      // ... LoL
      const amount = inputAsset.mul(0).add(amountValue);

      setInput(amount.gt(inputAsset) ? inputAsset : amount);
    },
    [inputAsset],
  );

  const fetchQuote = useCallback(async () => {
    if (!inputAsset || !outputAsset || !inputAssetValue || !skClient) return;

    setLoading(true);
    setRoutes([]);

    const senderAddress = skClient.getAddress(inputAsset.chain);
    const recipientAddress = skClient.getAddress(outputAsset.chain);

    try {
      const { routes } = await SwapKitApi.getQuote({
        sellAsset: inputAsset.toString(),
        sellAmount: inputAssetValue.toSignificant(inputAssetValue.decimal),
        buyAsset: outputAsset.toString(),
        senderAddress,
        recipientAddress,
        slippage: '3',
      });

      setRoutes(routes || []);
    } finally {
      setLoading(false);
    }
  }, [inputAssetValue, inputAsset, outputAsset, skClient]);

  const swap = async (route: QuoteRoute, inputAssetValue: AssetValue) => {
    if (!inputAsset || !outputAsset || !inputAssetValue || !skClient) return;



    await skClient
      .isAssetValueApproved(inputAssetValue, route.approvalTarget) ? handleSwap(route): skClient.approveAssetValue(inputAssetValue, route.approvalTarget);
  }

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <div>
        <div>
          <span>Input Asset:</span>
          {inputAsset?.toSignificant(6)} {inputAsset?.ticker}
        </div>

        <div>
          <span>Output Asset:</span>
          {outputAsset?.toSignificant(6)} {outputAsset?.ticker}
        </div>
      </div>

      <div>
        <div>
          <span>Input Amount:</span>
          <input
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            value={inputAssetValue?.toSignificant(inputAssetValue.decimal)}
          />
        </div>

        <button disabled={!inputAsset || !outputAsset} onClick={fetchQuote} type="button">
          {loading ? 'Loading...' : 'Get Quote'}
        </button>
      </div>

      {routes.length > 0 && (
        <div>
          <div>
            <span>Routes:</span>
            {routes.map((route) => (
              <div key={route.contract}>
                {route.meta?.quoteMode} ({route.providers.join(',')}){' '}
                <button onClick={() => swap(route, inputAssetValue)} type="button">
                  {'SWAP =>'} Estimated Output: {route.expectedOutput} {outputAsset?.ticker} ($
                  {parseFloat(route.expectedOutputUSD).toFixed(4)})
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { QuoteRoute, SwapKitApi } from '@thorswap-lib/swapkit-api';
import { Amount, AssetAmount } from '@thorswap-lib/swapkit-entities';
import { useCallback, useState } from 'react';

import { getSwapKitClient } from './swapKitClient';

type Props = {
  inputAsset?: AssetAmount;
  outputAsset?: AssetAmount;
  handleSwap: (route: QuoteRoute) => Promise<void>;
};

export const SwapInputs = ({ inputAsset, outputAsset, handleSwap }: Props) => {
  const skClient = getSwapKitClient();
  const [loading, setLoading] = useState(false);
  const [inputAmount, setInputAmount] = useState<Amount | undefined>();
  const [routes, setRoutes] = useState<QuoteRoute[]>([]);

  const setAmount = useCallback(
    (amountValue: string) => {
      if (!inputAsset) return;

      const value = parseFloat(amountValue);

      const amount = Amount.fromNormalAmount(value);
      setInputAmount(amount.gt(inputAsset.amount) ? inputAsset.amount : amount);
    },
    [inputAsset],
  );

  const fetchQuote = useCallback(async () => {
    if (!inputAsset || !outputAsset || !inputAmount) return;

    setLoading(true);
    setRoutes([]);

    const senderAddress = skClient.getAddress(inputAsset.asset.L1Chain);
    const recipientAddress = skClient.getAddress(outputAsset.asset.L1Chain);

    try {
      const { routes } = await SwapKitApi.getQuote({
        sellAsset: inputAsset.asset.toString(),
        sellAmount: inputAmount.assetAmount.toString(),
        buyAsset: outputAsset.asset.toString(),
        senderAddress,
        recipientAddress,
        slippage: '3',
      });

      setRoutes(routes || []);
    } finally {
      setLoading(false);
    }
  }, [inputAmount, inputAsset, outputAsset, skClient]);

  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
      <div>
        <div>
          <span>Input Asset:</span>
          {inputAsset?.amount.toSignificant(6)} {inputAsset?.asset.ticker}
        </div>

        <div>
          <span>Output Asset:</span>
          {outputAsset?.amount.toSignificant(6)} {outputAsset?.asset.ticker}
        </div>
      </div>

      <div>
        <div>
          <span>Input Amount:</span>
          <input
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            type="number"
            value={inputAmount?.toSignificant(6)}
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
                <button onClick={() => handleSwap(route)} type="button">
                  {'SWAP =>'} Estimated Output: {route.expectedOutput} {outputAsset?.asset.ticker}{' '}
                  ($
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

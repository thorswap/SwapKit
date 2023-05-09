import { Amount, AssetAmount } from '@thorswap-lib/swapkit-entities';
import { useCallback, useState } from 'react';

import { getSwapKitClient } from '../swapKitClient';

export default function Loan({
  inputAsset,
  outputAsset,
}: {
  inputAsset?: AssetAmount;
  outputAsset?: AssetAmount;
}) {
  const [openLoad, setOpenLoan] = useState(true);
  const [inputAmount, setInputAmount] = useState<Amount | undefined>();

  const setAmount = useCallback(
    (amountValue: string) => {
      if (!inputAsset) return;

      const value = parseFloat(amountValue);

      const amount = Amount.fromNormalAmount(value);
      setInputAmount(amount.gt(inputAsset.amount) ? inputAsset.amount : amount);
    },
    [inputAsset],
  );

  const handleLoanAction = useCallback(async () => {
    if (!inputAsset || !outputAsset || !inputAmount) return;
    const action = openLoad ? getSwapKitClient().openLoan : getSwapKitClient().closeLoan;

    const txHash = await action(inputAmount);
  }, [inputAsset, inputAmount, openLoad, outputAsset]);

  return (
    <div>
      <h4>Loan</h4>

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

          <button disabled={!inputAsset || !outputAsset} onClick={handleLoanAction} type="button">
            {openLoad ? 'Open Loan' : 'Close Loan'}
          </button>
        </div>
      </div>
    </div>
  );
}

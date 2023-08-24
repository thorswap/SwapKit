import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Amount, AssetAmount } from '@thorswap-lib/swapkit-entities';
import { Chain } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

export default function Send({
  inputAsset,
  skClient,
}: {
  skClient?: SwapKitCore;
  inputAsset?: AssetAmount;
}) {
  const [inputAmount, setInputAmount] = useState<Amount | undefined>();
  const [recipient, setRecipient] = useState('');

  const setAmount = useCallback(
    (amountValue: string) => {
      if (!inputAsset) return;

      const value = parseFloat(amountValue);
      const amount = Amount.fromNormalAmount(value);

      setInputAmount(amount.gt(inputAsset.amount) ? inputAsset.amount : amount);
    },
    [inputAsset],
  );

  const handleSend = useCallback(async () => {
    if (!inputAsset || !inputAmount || !skClient) return;
    const assetAmount = new AssetAmount(inputAsset.asset, inputAmount);

    const txHash = await skClient.transfer({
      assetAmount,
      memo: '',
      recipient,
    });

    window.open(`${skClient.getExplorerTxUrl(Chain.THORChain, txHash as string)}`, '_blank');
  }, [inputAsset, inputAmount, skClient, recipient]);

  return (
    <div>
      <h4>Send</h4>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <div>
          <div>
            <span>Input Asset:</span>
            {inputAsset?.amount.toSignificant(6)} {inputAsset?.asset.ticker}
          </div>
        </div>

        <div>
          <div>
            <span>Input Amount:</span>
            <input
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              value={inputAmount?.toSignificant(6)}
            />
          </div>

          <div>
            <span>Recipient:</span>
            <input
              onChange={e => setRecipient(e.target.value)}
              placeholder="address"
              value={recipient}
            />
          </div>

          <button disabled={!inputAsset} onClick={handleSend} type="button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

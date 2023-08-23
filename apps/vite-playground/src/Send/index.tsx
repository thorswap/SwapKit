import { SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Amount, AmountType, AssetAmount } from '@thorswap-lib/swapkit-entities';
import { Chain } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

export default function Send({
  inputAsset,
  skClient,
}: {
  skClient?: SwapKitCore;
  inputAsset?: AssetAmount;
}) {
  const [inputAmount, setInputAmount] = useState('');
  const [sendAmount, setSendAmount] = useState<Amount | undefined>();
  const [recipient, setRecipient] = useState('');

  const handleInputChange = (value: string) => {
    setInputAmount(value);

    if (!inputAsset) return;
    const float = parseFloat(value);
    const amount = new Amount(float, AmountType.ASSET_AMOUNT, inputAsset.asset.decimal);
    setSendAmount(amount);
  }


  const handleSend = useCallback(async () => {
    if (!inputAsset || !inputAmount || !skClient) return;
    const assetAmount = new AssetAmount(inputAsset.asset, sendAmount);

    const txHash = await skClient.transfer({
      assetAmount,
      memo: '',
      recipient,
    });

    window.open(`${skClient.getExplorerTxUrl(Chain.THORChain, txHash as string)}`, '_blank');
  }, [inputAsset, inputAmount, skClient, recipient, sendAmount]);

  return (
    <div>
      <h4>Send</h4>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <div>
          <div>
            <span>Input Asset: </span>
            {inputAsset?.amount.toSignificant(6)} {inputAsset?.asset.ticker}
          </div>
        </div>

        <div>
          <div>
            <span>Input Amount:</span>
            <input
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0.0"
              value={inputAmount}
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

import type { AssetValue, SwapKitCore } from '@thorswap-lib/swapkit-core';
import { Chain } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

export default function Send({
  inputAsset,
  skClient,
}: {
  skClient?: SwapKitCore;
  inputAsset: AssetValue;
}) {
  const [inputAssetValue, setInput] = useState<AssetValue>(inputAsset?.mul(0));
  const [recipient, setRecipient] = useState('');

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(inputAssetValue.mul(0).add(value));
    },
    [inputAssetValue],
  );

  const handleSend = useCallback(async () => {
    if (!inputAsset || !inputAssetValue.gt(0) || !skClient) return;

    const txHash = await skClient.transfer({
      assetValue: inputAssetValue,
      memo: '',
      recipient,
    });

    window.open(`${skClient.getExplorerTxUrl(Chain.THORChain, txHash as string)}`, '_blank');
  }, [inputAsset, inputAssetValue, skClient, recipient]);

  return (
    <div>
      <h4>Send</h4>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <div>
          <div>
            <span>Input Asset: </span>
            {inputAsset?.toSignificant(6)} {inputAsset?.ticker}
          </div>
        </div>

        <div>
          <div>
            <span>Input Amount:</span>
            <input
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="0.0"
              value={inputAssetValue.toSignificant(6)}
            />
          </div>

          <div>
            <span>Recipient:</span>
            <input
              onChange={(e) => setRecipient(e.target.value)}
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

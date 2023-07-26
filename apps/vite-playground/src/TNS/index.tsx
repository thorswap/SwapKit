import { Amount, SwapKitCore, getTHORNameCost } from '@thorswap-lib/swapkit-core';
import { Chain } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

export default function TNS({ skClient }: { skClient: SwapKitCore }) {
  const [selectedChain, setSelectedChain] = useState(Chain.THORChain);
  const [name, setName] = useState('');

  const registerTns = useCallback(async () => {
    // const owner = skClient.getAddress(Chain.THORChain);
    const address = skClient.getAddress(selectedChain);
    const params = { address, name, chain: selectedChain };

    try {
      const txHash = await skClient.registerThorname(
        params,
        Amount.fromNormalAmount(getTHORNameCost(1)),
      );

      window.open(`${skClient.getExplorerTxUrl(Chain.THORChain, txHash as string)}`, '_blank');
    } catch (e) {
      console.error(e);
      alert(e);
    }
  }, [name, selectedChain]);

  return (
    <div>
      <h3>TNS</h3>

      <div style={{ cursor: skClient ? 'default' : 'not-allowed' }}>
        <div
          style={{
            pointerEvents: skClient ? 'all' : 'none',
            opacity: skClient ? 1 : 0.5,
          }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
            <div>
              <select onChange={(e) => setSelectedChain(e.target.value as Chain)}>
                {Object.values(Chain).map((chain) => (
                  <option key={chain} value={chain}>
                    {chain}
                  </option>
                ))}
              </select>

              <input value={name} onChange={(e) => setName(e.target.value)} />

              <button onClick={registerTns} type="button">
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

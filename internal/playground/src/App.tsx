import type { SwapKitCore } from '@thorswap-lib/swapkit-core';
import type { AssetAmount } from '@thorswap-lib/swapkit-entities';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Loan from './Loan';
import Multisig from './Multisig';
import Send from './Send';
import Swap from './Swap';
import { getSwapKitClient } from './swapKitClient';
import TNS from './TNS';
import type { WalletDataType } from './types';
import { Wallet } from './Wallet';
import { WalletPicker } from './WalletPicker';

const apiKeys = ['walletConnectProjectId'] as const;

const App = () => {
  const [widgetType, setWidgetType] = useState<'swap' | 'loan' | 'earn'>('swap');
  const [wallet, setWallet] = useState<WalletDataType | WalletDataType[]>(null);
  const [phrase, setPhrase] = useState('');
  const [stagenet, setStagenet] = useState(false);
  const [skClient, setSkClient] = useState<SwapKitCore | null>(null);

  /**
   * NOTE: Test API keys - please use your own API keys in app as those will timeout, reach limits, etc.
   */
  const [keys, setKeys] = useState({
    covalentApiKey: 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
    ethplorerApiKey: 'EK-xs8Hj-qG4HbLY-LoAu7',
    utxoApiKey: 'A___Tcn5B16iC3mMj7QrzZCb2Ho1QBUf',
    walletConnectProjectId: '',
  });
  const [{ inputAsset, outputAsset }, setSwapAssets] = useState<{
    inputAsset?: AssetAmount;
    outputAsset?: AssetAmount;
  }>({});

  useEffect(() => {
    setSkClient(null);

    getSwapKitClient({ ...keys, stagenet }).then((client) => {
      setTimeout(() => {
        setSkClient(client);
      }, 1000);
    });
  }, [keys, stagenet]);

  const setAsset = useCallback(
    (asset: AssetAmount) => {
      if (!inputAsset) {
        setSwapAssets({ inputAsset: asset });
      } else if (!outputAsset) {
        setSwapAssets({ inputAsset, outputAsset: asset });
      } else {
        setSwapAssets({ inputAsset: asset, outputAsset: undefined });
      }
    },
    [inputAsset, outputAsset],
  );

  const Widgets = useMemo(
    () => ({
      swap: skClient ? (
        <Swap inputAsset={inputAsset} outputAsset={outputAsset} skClient={skClient} />
      ) : null,
      // eslint-disable-next-line react/jsx-pascal-case
      tns: skClient ? <TNS skClient={skClient} /> : null,
      loan: skClient ? (
        <Loan inputAsset={inputAsset} outputAsset={outputAsset} skClient={skClient} />
      ) : null,
      send: skClient ? <Send inputAsset={inputAsset} skClient={skClient} /> : null,
      earn: <div>Earn</div>,
      multisig: skClient ? (
        <Multisig inputAsset={inputAsset} phrase={phrase} skClient={skClient} stagenet={stagenet} />
      ) : null,
    }),
    [inputAsset, outputAsset, skClient, phrase],
  );

  return (
    <div>
      <h3>
        SwapKit Playground
        <div>
          {apiKeys.map((key) => (
            <input
              key={key}
              onChange={(e) => setKeys((k) => ({ ...k, [key]: e.target.value }))}
              placeholder={key}
              value={keys[key]}
            />
          ))}
        </div>
        <button onClick={() => setStagenet((v) => !v)} type="button">
          Toggle Stagenet - Currently = {`${stagenet}`.toUpperCase()}
        </button>
      </h3>

      <div style={{ cursor: skClient ? 'default' : 'not-allowed' }}>
        <div
          style={{
            pointerEvents: skClient ? 'all' : 'none',
            opacity: skClient ? 1 : 0.5,
          }}
        >
          <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
            {skClient && (
              <WalletPicker setPhrase={setPhrase} setWallet={setWallet} skClient={skClient} />
            )}

            <div>
              <select
                onChange={(e) => setWidgetType(e.target.value as 'loan')}
                style={{ marginBottom: 10 }}
              >
                {Object.keys(Widgets).map((widget) => (
                  <option key={widget} value={widget}>
                    {widget}
                  </option>
                ))}
              </select>

              {Widgets[widgetType]}
            </div>
          </div>

          {Array.isArray(wallet) ? (
            wallet.map((walletData) => (
              <Wallet key={walletData?.address} setAsset={setAsset} walletData={walletData} />
            ))
          ) : (
            <Wallet key={wallet?.address} setAsset={setAsset} walletData={wallet} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

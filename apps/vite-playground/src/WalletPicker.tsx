import { decryptFromKeystore } from '@thorswap-lib/keystore';
import { getDerivationPathFor } from '@thorswap-lib/ledger';
import { Chain, WalletOption } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

import { getSwapKitClient } from './swapKitClient';
import { WalletDataType } from './types';

type Props = {
  setWallet: (wallet: WalletDataType | WalletDataType[]) => void;
};

const walletOptions = Object.values(WalletOption).filter(
  (o) => ![WalletOption.KEPLR, WalletOption.TRUSTWALLET, WalletOption.READONLY].includes(o),
);

const AllChainsSupported = [
  Chain.Avalanche,
  Chain.Binance,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Doge,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.THORChain,
] as Chain[];

const EVMChainsSupported = [Chain.Ethereum, Chain.Avalanche] as Chain[];

export const availableChainsByWallet: Record<WalletOption, Chain[]> = {
  [WalletOption.BRAVE]: EVMChainsSupported,
  [WalletOption.COINBASE_WEB]: EVMChainsSupported,
  [WalletOption.KEPLR]: [Chain.Cosmos],
  [WalletOption.KEYSTORE]: AllChainsSupported,
  [WalletOption.LEDGER]: AllChainsSupported,
  [WalletOption.METAMASK]: EVMChainsSupported,
  [WalletOption.TRUSTWALLET_WEB]: EVMChainsSupported,
  [WalletOption.TRUSTWALLET]: [Chain.THORChain, Chain.Ethereum, Chain.Binance],
  [WalletOption.XDEFI]: AllChainsSupported,
  [WalletOption['READONLY']]: [],
};

export const WalletPicker = ({ setWallet }: Props) => {
  const skClient = getSwapKitClient();
  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState<Chain[]>([]);
  const [readOnlyVisible, setReadOnlyVisible] = useState(false);
  const [readOnlyAddresses, setReadOnlyAddresses] = useState<{ [key in Chain]?: string }>({});

  const connectWallet = useCallback(
    async (option: WalletOption) => {
      if (!skClient) return alert('client is not ready');
      switch (option) {
        case WalletOption.XDEFI:
          return skClient.connectXDEFI(chains);

        case WalletOption.COINBASE_WEB:
        case WalletOption.METAMASK:
        case WalletOption.TRUSTWALLET_WEB:
          return skClient.connectEVMWallet(chains, option);

        case WalletOption.LEDGER: {
          const derivationPath = getDerivationPathFor({ chain: chains[0], index: 1 });
          return skClient.connectLedger(chains[0], derivationPath);
        }

        default:
          break;
      }
    },
    [chains, skClient],
  );

  const fetchConnectedData = useCallback(async () => {
    const walletDataArray = await Promise.all(chains.map(skClient.getWalletByChain));

    setWallet(walletDataArray.filter(Boolean));
    setLoading(false);
  }, [chains, setWallet, skClient.getWalletByChain]);

  const handleKeystoreConnection = useCallback(
    async ({ target }: any) => {
      if (!skClient) return alert('client is not ready');
      setLoading(true);

      const keystoreFile = await target.files[0].text();

      setTimeout(async () => {
        const password = prompt('Enter password');

        if (!password) return alert('password is required');
        try {
          const phrases = await decryptFromKeystore(JSON.parse(keystoreFile), password);

          await skClient.connectKeystore(chains, phrases);
          fetchConnectedData();
        } catch (e) {
          alert(e);
        }
      }, 500);
    },
    [chains, fetchConnectedData, skClient],
  );

  const handleConnection = useCallback(
    async (option: WalletOption) => {
      if (!skClient) return alert('client is not ready');
      setLoading(true);
      await connectWallet(option);

      fetchConnectedData();
    },
    [connectWallet, fetchConnectedData, skClient],
  );

  const connectReadonly = useCallback(async () => {
    if (!skClient) return alert('client is not ready');
    setLoading(true);

    skClient.connectReadOnly(readOnlyAddresses);

    fetchConnectedData();
  }, [fetchConnectedData, readOnlyAddresses, skClient]);

  const isWalletDisabled = useCallback(
    (wallet: WalletOption) =>
      chains.length > 0
        ? !chains.every((chain) => availableChainsByWallet[wallet].includes(chain))
        : false,
    [chains],
  );

  const handleChainSelect = useCallback((chain: Chain) => {
    setChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div style={{ flexDirection: 'column' }}>
        <select multiple style={{ width: 200, height: 200 }} value={chains}>
          {Object.values(Chain).map((chain) => (
            <option key={chain} onClick={() => handleChainSelect(chain)} value={chain}>
              {chain}
            </option>
          ))}
        </select>

        {loading && <div>Loading...</div>}
      </div>

      <div>
        {walletOptions.map((option) => (
          <div key={option} style={{ padding: '8px' }}>
            {option === WalletOption.KEYSTORE ? (
              <label className="label">
                <input
                  accept=".txt"
                  disabled={!chains.length || isWalletDisabled(option)}
                  id="keystoreFile"
                  name={option}
                  onChange={handleKeystoreConnection}
                  title="asdf"
                  type="file"
                />
                <span>{option}</span>
              </label>
            ) : (
              <button
                disabled={!chains.length || isWalletDisabled(option)}
                onClick={() => handleConnection(option)}
                type="button"
              >
                {option}
              </button>
            )}
          </div>
        ))}

        <div>
          <button onClick={() => setReadOnlyVisible((prev) => !prev)} type="button">
            Toggle read only form
          </button>
          {readOnlyVisible && (
            <div>
              {chains.map((chain) => (
                <div key={chain}>
                  <div>{chain}</div>
                  <div>
                    <input
                      onChange={(e) =>
                        setReadOnlyAddresses((prev) => ({ ...prev, [chain]: e.target.value }))
                      }
                      value={readOnlyAddresses[chain]}
                    />
                  </div>
                </div>
              ))}

              <button
                disabled={!Object.values(readOnlyAddresses).every(Boolean)}
                onClick={connectReadonly}
                type="button"
              >
                Connect read only
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

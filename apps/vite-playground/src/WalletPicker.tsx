import { Chain, WalletOption } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

import { getSwapKitClient } from './swapKitClient';
import { WalletDataType } from './types';

type Props = {
  setWallet: (wallet: WalletDataType | WalletDataType[]) => void;
};

const walletOptions = Object.values(WalletOption).filter(
  (o) => ![WalletOption.KEYSTORE, WalletOption.KEPLR, WalletOption.TRUSTWALLET].includes(o),
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
};

export const WalletPicker = ({ setWallet }: Props) => {
  const skClient = getSwapKitClient();
  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState<Chain[]>([]);

  const connectWallet = useCallback(
    async (option: WalletOption) => {
      if (!skClient) return alert('client is not ready');
      switch (option) {
        case WalletOption.XDEFI:
          await skClient.connectXDEFI(chains);
          break;

        case WalletOption.COINBASE_WEB:
        case WalletOption.METAMASK:
        case WalletOption.TRUSTWALLET_WEB:
          await skClient.connectEVMWallet(chains, option);
          break;

        default:
          break;
      }
    },
    [chains, skClient],
  );

  const handleConnection = useCallback(
    async (option: WalletOption) => {
      if (!skClient) return alert('client is not ready');
      setLoading(true);
      await connectWallet(option);

      const walletDataArray = await Promise.all(chains.map(skClient.getWalletByChain));

      setWallet(walletDataArray.filter(Boolean));
      setLoading(false);
    },
    [chains, connectWallet, setWallet, skClient],
  );

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
            <button
              disabled={!chains.length || isWalletDisabled(option)}
              onClick={() => handleConnection(option)}
              type="button"
            >
              {option}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

import type { SwapKitCore } from "@swapkit/core";
import { Chain, EVMChainList, WalletOption } from "@swapkit/types";
import { decryptFromKeystore } from "@swapkit/wallet-keystore";
import { getDerivationPathFor } from "@swapkit/wallet-ledger";
import { useCallback, useState } from "react";

import type { WalletDataType } from "./types";

type Props = {
  setPhrase: (phrase: string) => void;
  setWallet: (wallet: WalletDataType | WalletDataType[]) => void;
  skClient?: SwapKitCore;
};

const walletOptions = Object.values(WalletOption).filter((o) => ![WalletOption.KEPLR].includes(o));

const AllChainsSupported = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Maya,
  Chain.Kujira,
  Chain.THORChain,
] as Chain[];

export const availableChainsByWallet: Record<WalletOption, Chain[]> = {
  [WalletOption.BRAVE]: EVMChainList,
  [WalletOption.OKX_MOBILE]: EVMChainList,
  [WalletOption.COINBASE_WEB]: EVMChainList,
  [WalletOption.KEPLR]: [Chain.Cosmos],
  [WalletOption.KEYSTORE]: [...AllChainsSupported, Chain.Polkadot, Chain.Chainflip],
  [WalletOption.KEEPKEY]: [
    Chain.Arbitrum,
    Chain.Avalanche,
    Chain.Binance,
    Chain.BinanceSmartChain,
    Chain.Bitcoin,
    Chain.BitcoinCash,
    Chain.Cosmos,
    Chain.Dash,
    Chain.Dogecoin,
    Chain.Ethereum,
    Chain.Litecoin,
    Chain.Optimism,
    Chain.Polygon,
    Chain.THORChain,
    Chain.Maya,
  ],
  [WalletOption.LEDGER]: AllChainsSupported,
  [WalletOption.TREZOR]: [
    Chain.Bitcoin,
    Chain.BitcoinCash,
    Chain.Litecoin,
    Chain.Dash,
    Chain.Dogecoin,
    Chain.Ethereum,
    Chain.Avalanche,
    Chain.BinanceSmartChain,
    Chain.Optimism,
    Chain.Arbitrum,
    Chain.Polygon,
  ],
  [WalletOption.METAMASK]: EVMChainList,
  [WalletOption.TRUSTWALLET_WEB]: EVMChainList,
  [WalletOption.XDEFI]: AllChainsSupported,
  [WalletOption.WALLETCONNECT]: [
    Chain.Ethereum,
    Chain.Binance,
    Chain.BinanceSmartChain,
    Chain.Avalanche,
    Chain.THORChain,
    Chain.Maya,
    Chain.Polygon,
    Chain.Arbitrum,
    Chain.Optimism,
  ],
  [WalletOption.OKX]: [
    Chain.Ethereum,
    Chain.Avalanche,
    Chain.BinanceSmartChain,
    Chain.Bitcoin,
    Chain.Cosmos,
    Chain.Polygon,
    Chain.Arbitrum,
    Chain.Optimism,
  ],
};

export const WalletPicker = ({ skClient, setWallet, setPhrase }: Props) => {
  const [loading, setLoading] = useState(false);
  const [chains, setChains] = useState<Chain[]>([]);
  const connectWallet = useCallback(
    async (option: WalletOption) => {
      if (!skClient) return alert("client is not ready");
      switch (option) {
        case WalletOption.XDEFI:
          return skClient.connectXDEFI(chains);
        case WalletOption.OKX:
          return skClient.connectOkx(chains);
        case WalletOption.COINBASE_WEB:
        case WalletOption.METAMASK:
        case WalletOption.TRUSTWALLET_WEB:
          return skClient.connectEVMWallet(chains, option);
        case WalletOption.KEEPKEY: {
          const derivationPaths = []; // Ensure derivationPaths is defined
          for (const chain of chains) {
            // Use 'let' for iteration variable
            const derivationPath = getDerivationPathFor({ chain: chain, index: 0 });
            derivationPaths.push(derivationPath);
          }
          const apiKey: string = await skClient.connectKeepkey(chains, derivationPaths);
          localStorage.setItem("keepkeyApiKey", apiKey);
          return true;
        }
        case WalletOption.LEDGER: {
          const derivationPath = getDerivationPathFor({ chain: chains[0], index: 0 });
          return skClient.connectLedger(chains[0], derivationPath);
        }

        case WalletOption.TREZOR: {
          const derivationPath = getDerivationPathFor({ chain: chains[0], index: 0 });
          return skClient.connectTrezor(chains[0], derivationPath);
        }
        case WalletOption.WALLETCONNECT: {
          return skClient.connectWalletconnect(chains);
        }
        default:
          break;
      }
    },
    [chains, skClient],
  );

  const handleKeystoreConnection = useCallback(
    async ({ target }: any) => {
      if (!skClient) return alert("client is not ready");
      setLoading(true);

      const keystoreFile = await target.files[0].text();

      setTimeout(async () => {
        const password = prompt("Enter password");

        if (!password) return alert("password is required");
        try {
          const phrases = await decryptFromKeystore(JSON.parse(keystoreFile), password);
          setPhrase(phrases);

          await skClient.connectKeystore(chains, phrases);
          const walletDataArray = await Promise.all(
            chains.map((chain) => skClient.getWalletByChain(chain, true)),
          );

          setWallet(walletDataArray.filter(Boolean));
          setLoading(false);
        } catch (e) {
          console.error(e);
          alert(e);
        }
      }, 500);
    },
    [chains, setWallet, skClient, setPhrase],
  );

  const handleConnection = useCallback(
    async (option: WalletOption) => {
      if (!skClient) return alert("client is not ready");
      setLoading(true);
      await connectWallet(option);

      const walletDataArray = await Promise.all(
        chains.map((chain) => skClient.getWalletByChain(chain, true)),
      );

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

  const handleMultipleSelect = useCallback(
    (e: any) => {
      const selectedChains = Array.from(e.target.selectedOptions).map((o: any) => o.value);

      if (selectedChains.length > 1) {
        setChains(selectedChains);
      }
    },
    [setChains],
  );

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ flexDirection: "column" }}>
        <select
          multiple
          onChange={handleMultipleSelect}
          style={{ width: 50, height: 400 }}
          value={chains}
        >
          {[
            Chain.Avalanche,
            Chain.Binance,
            Chain.BinanceSmartChain,
            Chain.Bitcoin,
            Chain.BitcoinCash,
            Chain.Cosmos,
            Chain.Dogecoin,
            Chain.Dash,
            Chain.Ethereum,
            Chain.Litecoin,
            Chain.Polkadot,
            Chain.Chainflip,
            Chain.THORChain,
            Chain.Arbitrum,
            Chain.Kujira,
            Chain.Maya,
            Chain.Optimism,
            Chain.Polygon,
          ].map((chain) => (
            <option key={chain} onClick={() => handleChainSelect(chain)} value={chain}>
              {chain}
            </option>
          ))}
        </select>

        {loading && <div>Loading...</div>}
      </div>

      <div>
        {walletOptions.map((option) => (
          <div key={option} style={{ padding: "8px" }}>
            {option === WalletOption.KEYSTORE ? (
              <label className="label">
                <input
                  accept=".txt"
                  disabled={!chains.length}
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
      </div>
    </div>
  );
};

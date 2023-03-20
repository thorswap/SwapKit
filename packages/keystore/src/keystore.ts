import { HDNode } from '@ethersproject/hdnode';
import { Chain, DerivationPath, WalletOption } from '@thorswap-lib/types';

import {
  avalancheWalletMethods,
  binanceSmartChainWalletMethods,
  binanceWalletMethods,
  bitcoincashWalletMethods,
  bitcoinWalletMethods,
  cosmosWalletMethods,
  dogecoinWalletMethods,
  ethereumWalletMethods,
  litecoinWalletMethods,
  thorchainWalletMethods,
} from './walletMethods.js';

type KeystoreOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
};

type Params = KeystoreOptions & {
  chain: Chain;
  phrase: string;
  index: number;
};

const getWalletMethodsForChain = async ({
  chain,
  phrase,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  index,
}: Params) => {
  const derivationPath = `${DerivationPath[chain]}/${index}`;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      const hdNode = HDNode.fromMnemonic(phrase);
      const derivedPath = hdNode.derivePath(derivationPath);
      if (!covalentApiKey) throw new Error('Covalent API key not found');

      const walletMethods =
        chain === Chain.Avalanche
          ? await avalancheWalletMethods({ covalentApiKey, derivedPath })
          : await binanceSmartChainWalletMethods({ covalentApiKey, derivedPath });

      return {
        address: derivedPath.address,
        walletMethods,
      };
    }

    case Chain.Ethereum: {
      const hdNode = HDNode.fromMnemonic(phrase);
      const derivedPath = hdNode.derivePath(derivationPath);
      if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');

      const walletMethods = await ethereumWalletMethods({
        ethplorerApiKey,
        derivedPath,
      });

      return { address: derivedPath.address, walletMethods };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Doge:
    case Chain.Litecoin: {
      if (!utxoApiKey) throw new Error('UTXO API key not found');

      const params = { utxoApiKey, derivationPath, phrase };
      const walletMethods =
        chain === Chain.Bitcoin
          ? bitcoinWalletMethods(params)
          : chain === Chain.Litecoin
          ? litecoinWalletMethods(params)
          : chain === Chain.Doge
          ? dogecoinWalletMethods(params)
          : bitcoincashWalletMethods(params);

      return { address: walletMethods.getAddress(), walletMethods };
    }

    case Chain.Binance:
    case Chain.Cosmos:
    case Chain.THORChain: {
      const walletMethods =
        chain === Chain.Binance
          ? binanceWalletMethods({ phrase })
          : chain === Chain.Cosmos
          ? cosmosWalletMethods({ phrase })
          : thorchainWalletMethods({ phrase });

      return { address: walletMethods.getAddress(), walletMethods };
    }
    default:
      throw new Error('Chain not supported');
  }
};

const connectKeystore =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey, utxoApiKey },
  }: {
    addChain: any;
    config: KeystoreOptions;
  }) =>
  async (chains: Chain[], phrase: string, index: number = 0) => {
    const promises = chains.map(async (chain) => {
      const { address, walletMethods } = await getWalletMethodsForChain({
        index,
        chain,
        covalentApiKey,
        ethplorerApiKey,
        phrase,
        utxoApiKey,
      });

      addChain({
        chain,
        walletMethods,
        wallet: { address, balance: [], walletType: WalletOption.KEYSTORE },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const keystoreWallet = {
  connectMethodName: 'connectKeystore' as const,
  connect: connectKeystore,
  isDetected: () => true,
};

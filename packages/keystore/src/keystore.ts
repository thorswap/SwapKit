import { HDNode } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import { AssetAtom, BinanceToolbox, GaiaToolbox, getDenom } from '@thorswap-lib/toolbox-cosmos';
import { AVAXToolbox, BSCToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import {
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  UTXOTransferParams,
} from '@thorswap-lib/toolbox-utxo';
import { Chain, DerivationPath, TxParams, WalletOption } from '@thorswap-lib/types';
import { Psbt } from 'bitcoinjs-lib';

import { bitcoincashWalletMethods, thorchainWalletMethods } from './walletMethods.js';

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
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum) {
        if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');
      } else {
        if (!covalentApiKey) throw new Error('Covalent API key not found');
      }

      const hdNode = HDNode.fromMnemonic(phrase);
      const derivedPath = hdNode.derivePath(derivationPath);

      const provider = getProvider(chain);
      const wallet = new Wallet(derivedPath).connect(provider);
      const params = { provider, signer: wallet };

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox({ ...params, ethplorerApiKey: ethplorerApiKey! })
          : chain === Chain.Avalanche
          ? AVAXToolbox({ ...params, covalentApiKey: covalentApiKey! })
          : BSCToolbox({ ...params, covalentApiKey: covalentApiKey! });

      return {
        address: derivedPath.address,
        walletMethods: {
          ...toolbox,
          getAddress: () => derivedPath.address,
        },
      };
    }

    case Chain.BitcoinCash: {
      if (!utxoApiKey) throw new Error('UTXO API key not found');
      const walletMethods = bitcoincashWalletMethods({ phrase, derivationPath, utxoApiKey });
      return { address: walletMethods.getAddress(), walletMethods };
    }

    case Chain.Bitcoin:
    case Chain.Doge:
    case Chain.Litecoin: {
      if (!utxoApiKey) throw new Error('UTXO API key not found');

      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox(utxoApiKey)
          : chain === Chain.Litecoin
          ? LTCToolbox(utxoApiKey)
          : DOGEToolbox(utxoApiKey);

      const keys = toolbox.createKeysForPath({ phrase, derivationPath });
      const address = toolbox.getAddressFromKeys(keys);

      const signTransaction = async (psbt: Psbt) => {
        psbt.signAllInputs(keys);

        return psbt;
      };

      return {
        ...toolbox,
        address,
        getAddress: () => address,
        transfer: (params: UTXOTransferParams) =>
          toolbox.transfer({ ...params, from: address, signTransaction }),
      };
    }

    case Chain.Binance:
    case Chain.Cosmos: {
      const toolbox = chain === Chain.Binance ? BinanceToolbox() : GaiaToolbox();
      const privkey = toolbox.createKeyPair(phrase);
      const from = toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ asset, amount, recipient, memo }: TxParams) =>
        toolbox.transfer({
          from,
          to: recipient,
          privkey,
          asset: getDenom(asset || AssetAtom),
          amount: amount.amount().toString(),
          memo,
        });

      return { ...toolbox, transfer, address: from, getAddress: () => from };
    }

    case Chain.THORChain: {
      const walletMethods = thorchainWalletMethods({ phrase });

      return { address: walletMethods.getAddress(), walletMethods };
    }
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

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
import {
  Chain,
  ConnectWalletParams,
  DerivationPath,
  TxParams,
  WalletOption,
} from '@thorswap-lib/types';
import { Psbt } from 'bitcoinjs-lib';

import { bitcoincashWalletMethods, thorchainWalletMethods } from './walletMethods.js';

type KeystoreOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
  stagenet?: boolean;
};

type Params = KeystoreOptions & {
  api?: any;
  rpcUrl?: string;
  chain: Chain;
  phrase: string;
  index: number;
};

const getWalletMethodsForChain = async ({
  api,
  rpcUrl,
  chain,
  phrase,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  index,
  stagenet,
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

      const provider = getProvider(chain, rpcUrl);
      const wallet = new Wallet(derivedPath).connect(provider);
      const params = { api, provider, signer: wallet as any };

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
      const walletMethods = bitcoincashWalletMethods({
        rpcUrl,
        phrase,
        derivationPath,
        utxoApiKey,
      });
      return { address: walletMethods.getAddress(), walletMethods };
    }

    case Chain.Bitcoin:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox(utxoApiKey, rpcUrl)
          : chain === Chain.Litecoin
          ? LTCToolbox(utxoApiKey, rpcUrl)
          : DOGEToolbox(utxoApiKey, rpcUrl);

      const keys = toolbox.createKeysForPath({ phrase, derivationPath });
      const address = toolbox.getAddressFromKeys(keys);

      const signTransaction = async (psbt: Psbt) => {
        psbt.signAllInputs(keys);

        return psbt;
      };

      return {
        address,
        walletMethods: {
          ...toolbox,
          getAddress: () => address,
          transfer: (params: UTXOTransferParams) =>
            toolbox.transfer({ ...params, from: address, signTransaction }),
        },
      };
    }

    case Chain.Binance: {
      const toolbox = BinanceToolbox();
      const privkey = await toolbox.createKeyPair(phrase);
      const from = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ asset, amount, recipient, memo }: TxParams) =>
        toolbox.transfer({
          from,
          to: recipient,
          privkey,
          asset: getDenom(asset || AssetAtom),
          amount: amount.amount().toString(),
          memo,
        });

      return {
        address: from,
        walletMethods: { ...toolbox, transfer, getAddress: () => from },
      };
    }
    case Chain.Cosmos: {
      const toolbox = GaiaToolbox({ server: api });
      const signer = await toolbox.getSigner(phrase);
      const from = toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ asset, amount, recipient, memo }: TxParams) =>
        toolbox.transfer({
          from,
          to: recipient,
          signer,
          asset: getDenom(asset || AssetAtom),
          amount: amount.amount().toString(),
          memo,
        });

      return {
        address: from,
        walletMethods: { ...toolbox, transfer, getAddress: () => from },
      };
    }

    case Chain.THORChain: {
      const walletMethods = thorchainWalletMethods({ phrase, stagenet });

      return { address: walletMethods.getAddress() as string, walletMethods };
    }

    default:
      throw new Error(`Unsupported chain ${chain}`);
  }
};

const connectKeystore =
  ({
    addChain,
    apis,
    rpcUrls,
    config: { covalentApiKey, ethplorerApiKey, utxoApiKey, stagenet },
  }: ConnectWalletParams) =>
  async (chains: Chain[], phrase: string, index: number = 0) => {
    const promises = chains.map(async (chain) => {
      const { address, walletMethods } = await getWalletMethodsForChain({
        index,
        chain,
        api: apis[chain as Chain.Avalanche],
        rpcUrl: rpcUrls[chain],
        covalentApiKey,
        ethplorerApiKey,
        phrase,
        utxoApiKey,
        stagenet,
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

import { HDNode } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import type { UTXOTransferParams } from '@thorswap-lib/toolbox-utxo';
import type { ConnectWalletParams, TxParams } from '@thorswap-lib/types';
import { Chain, DerivationPath, WalletOption } from '@thorswap-lib/types';
import type { Psbt } from 'bitcoinjs-lib';

import { bitcoincashWalletMethods, thorchainWalletMethods } from './walletMethods.ts';

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
      if (chain === Chain.Ethereum && !ethplorerApiKey) {
        throw new Error('Ethplorer API key not found');
      } else if (!covalentApiKey) {
        throw new Error('Covalent API key not found');
      }

      const { getProvider, ETHToolbox, AVAXToolbox, BSCToolbox } = await import(
        '@thorswap-lib/toolbox-evm'
      );

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
      const walletMethods = await bitcoincashWalletMethods({
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
      const params = { rpcUrl, apiKey: utxoApiKey, apiClient: api };

      const { BTCToolbox, LTCToolbox, DOGEToolbox } = await import('@thorswap-lib/toolbox-utxo');

      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox(params)
          : chain === Chain.Litecoin
          ? LTCToolbox(params)
          : DOGEToolbox(params);

      const keys = await toolbox.createKeysForPath({ phrase, derivationPath });
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
      const { getDenom, AssetAtom, BinanceToolbox } = await import('@thorswap-lib/toolbox-cosmos');
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
      const { getDenom, AssetAtom, GaiaToolbox } = await import('@thorswap-lib/toolbox-cosmos');
      const toolbox = GaiaToolbox({ server: api });
      const signer = await toolbox.getSigner(phrase);
      const from = await toolbox.getAddressFromMnemonic(phrase);

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
      const walletMethods = await thorchainWalletMethods({ phrase, stagenet });

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
};

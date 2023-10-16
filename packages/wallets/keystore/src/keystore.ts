import type { TransferParams } from '@swapkit/cosmos';
import type { ConnectWalletParams } from '@swapkit/types';
import { Chain, DerivationPath, WalletOption } from '@swapkit/types';
import type { UTXOTransferParams } from '@swapkit/utxo';
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

      const { HDNodeWallet } = await import('ethers');
      const { getProvider, ETHToolbox, AVAXToolbox, BSCToolbox } = await import(
        '@swapkit/toolbox-evm'
      );

      const provider = getProvider(chain, rpcUrl);
      const wallet = HDNodeWallet.fromPhrase(phrase).connect(provider);

      const params = { api, provider, signer: wallet };

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox({ ...params, ethplorerApiKey: ethplorerApiKey! })
          : chain === Chain.Avalanche
          ? AVAXToolbox({ ...params, covalentApiKey: covalentApiKey! })
          : BSCToolbox({ ...params, covalentApiKey: covalentApiKey! });

      return {
        address: wallet.address,
        walletMethods: {
          ...toolbox,
          getAddress: () => wallet.address,
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

      const { BTCToolbox, LTCToolbox, DOGEToolbox } = await import('@swapkit/toolbox-utxo');

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
      const { BinanceToolbox } = await import('@swapkit/toolbox-cosmos');
      const toolbox = BinanceToolbox();
      const privkey = await toolbox.createKeyPair(phrase);
      const from = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from,
          recipient,
          assetValue,
          privkey,
          memo,
        });

      return {
        address: from,
        walletMethods: { ...toolbox, transfer, getAddress: () => from },
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import('@swapkit/toolbox-cosmos');
      const toolbox = GaiaToolbox({ server: api });
      const signer = await toolbox.getSigner(phrase);
      const from = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from,
          recipient,
          signer,
          assetValue,
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

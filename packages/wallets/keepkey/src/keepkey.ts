import { Signer } from '@ethersproject/abstract-signer';
import { AVAXToolbox, BSCToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import { Chain, ConnectWalletParams, DerivationPathArray, WalletOption } from '@thorswap-lib/types';

import { getEVMSigner } from './signer/evm.js';

export const KEEPKEY_SUPPORTED_CHAINS = [
  Chain.Avalanche,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Litecoin,
] as const;

type KeepKeyOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
  trezorManifest?: {
    email: string;
    appUrl: string;
  };
};

type Params = KeepKeyOptions & {
  chain: Chain;
  derivationPath: DerivationPathArray;
  rpcUrl?: string;
  api?: any;
};

const getToolbox = async (params: Params) => {
  const { api, rpcUrl, chain, ethplorerApiKey, covalentApiKey, derivationPath, utxoApiKey } =
    params;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Ethereum:
      const provider = getProvider(chain, rpcUrl);
      const signer = (await getEVMSigner({ chain, derivationPath, provider })) as Signer;
      const address = await signer.getAddress();

      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error('Ethplorer API key not found');
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error('Covalent API key not found');

      const evmParams = { api, signer, provider };
      const walletMethods =
        chain === Chain.Ethereum
          ? ETHToolbox({ ...evmParams, ethplorerApiKey: ethplorerApiKey as string })
          : (chain === Chain.Avalanche ? AVAXToolbox : BSCToolbox)({
              ...evmParams,
              covalentApiKey: covalentApiKey as string,
            });

      return { address, walletMethods: { ...walletMethods, getAddress: () => address } };

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin:
      if (!utxoApiKey && !api) throw new Error('UTXO API key not found');

      const scriptType =
        derivationPath[0] === 84
          ? { input: 'SPENDWITNESS', output: 'PAYTOWITNESS' }
          : derivationPath[0] === 49
          ? { input: 'SPENDP2SHWITNESS', output: 'PAYTOP2SHWITNESS' }
          : derivationPath[0] === 44
          ? { input: 'SPENDADDRESS', output: 'PAYTOADDRESS' }
          : undefined;

      if (!scriptType) throw new Error('Derivation path is not supported');

      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox
          : chain === Chain.Litecoin
          ? LTCToolbox
          : chain === Chain.Dogecoin
          ? DOGEToolbox
          : BCHToolbox;

      const utxoMethods = toolbox(utxoApiKey, api);

      // Placeholder functions
      const getAddress = async () => 'PlaceholderAddress';
      const signTransaction = async () => 'PlaceholderSignedTransaction';
      const transfer = async () => 'PlaceholderTransfer';

      return {
        address: 'PlaceholderAddress',
        walletMethods: { ...utxoMethods, getAddress, signTransaction, transfer },
      };

    default:
      throw new Error('Chain not supported');
  }
};

const connectKeepKey =
  ({
    apis,
    rpcUrls,
    addChain,
    config: { covalentApiKey, ethplorerApiKey = 'freekey', utxoApiKey },
  }: ConnectWalletParams) =>
  async (chain: (typeof KEEPKEY_SUPPORTED_CHAINS)[number], derivationPath: DerivationPathArray) => {

    const { address, walletMethods } = await getToolbox({
      api: apis[chain as Chain.Ethereum],
      rpcUrl: rpcUrls[chain],
      chain,
      covalentApiKey,
      ethplorerApiKey,
      utxoApiKey,
      derivationPath,
    });

    addChain({
      chain,
      walletMethods,
      wallet: { address, balance: [], walletType: WalletOption.TREZOR },
    });

    return true;
  };

export const keepkeyWallet = {
  connectMethodName: 'connectKeepKey' as const,
  connect: connectKeepKey,
  isDetected: () => true,
};

import { Signer } from '@ethersproject/abstract-signer';
import { derivationPathToString } from '@thorswap-lib/helpers';
import { AVAXToolbox, BSCToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import {
  BCHToolbox,
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  UTXOTransferParams,
} from '@thorswap-lib/toolbox-utxo';
import {
  Chain,
  ConnectWalletParams,
  DerivationPathArray,
  FeeOption,
  WalletOption,
} from '@thorswap-lib/types';
import TrezorConnect from '@trezor/connect-web';
import { Psbt } from 'bitcoinjs-lib';

import { getEVMSigner } from './signer/evm.js';

export const TREZOR_SUPPORTED_CHAINS = [
  Chain.Avalanche,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Doge,
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Litecoin,
] as const;

type TrezorOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
  trezorManifest?: {
    email: string;
    appUrl: string;
  };
};

type Params = TrezorOptions & {
  chain: Chain;
  derivationPath: DerivationPathArray;
  rpcUrl?: string;
  api?: any;
};

const getToolbox = async ({
  api,
  rpcUrl,
  chain,
  ethplorerApiKey,
  covalentApiKey,
  derivationPath,
  utxoApiKey,
}: Params) => {
  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error('Ethplorer API key not found');
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error('Covalent API key not found');

      const provider = getProvider(chain, rpcUrl);
      const signer = (await getEVMSigner({ chain, derivationPath, provider })) as Signer;

      const address = await signer.getAddress();
      const params = { api, signer, provider };
      const walletMethods =
        chain === Chain.Ethereum
          ? ETHToolbox({ ...params, ethplorerApiKey: ethplorerApiKey as unknown as string })
          : (chain === Chain.Avalanche ? AVAXToolbox : BSCToolbox)({
              ...params,
              covalentApiKey: covalentApiKey as unknown as string,
            });

      return { address, walletMethods: { ...walletMethods, getAddress: () => address } };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Doge:
    case Chain.Litecoin: {
      if (!utxoApiKey && !api) throw new Error('UTXO API key not found');
      const coin = chain.toLowerCase() as 'btc' | 'bch' | 'ltc' | 'doge';
      const toolbox = (
        chain === Chain.Bitcoin
          ? BTCToolbox
          : chain === Chain.Litecoin
          ? LTCToolbox
          : chain === Chain.Doge
          ? DOGEToolbox
          : BCHToolbox
      )(utxoApiKey, api);

      const signTransaction = async (psbt: Psbt, memo: string = '') => {
        const result = await //@ts-ignore
        (TrezorConnect as unknown as TrezorConnect.TrezorConnect).signTransaction({
          coin,
          inputs: psbt.txInputs.map((input: any) => ({
            // Hardens the first 3 elements of the derivation path - required by trezor
            address_n: derivationPath.map((pathElement, index) =>
              index < 3 ? (pathElement | 0x80000000) >>> 0 : pathElement,
            ),
            prev_hash: input.hash.reverse().toString('hex'),
            prev_index: input.index,
            // object needs amount but does not use it for signing
            amount: 0,
          })),
          outputs: psbt.txOutputs.map((output: any) => {
            if (!output.address) {
              return {
                op_return_data: Buffer.from(memo).toString('hex'),
                amount: '0',
                script_type: 'PAYTOOPRETURN',
              };
            }
            return {
              address: output.address as string,
              amount: output.value,
              script_type: 'PAYTOADDRESS',
            };
          }),
        });

        if (result.success) {
          return result.payload.serializedTx;
        } else {
          throw new Error(
            `Trezor failed to sign the ${chain.toUpperCase()} transaction: ${
              (result.payload as { error: string; code?: string }).error
            }`,
          );
        }
      };

      const transfer = async ({
        from,
        recipient,
        feeOptionKey,
        feeRate,
        memo,
        ...rest
      }: UTXOTransferParams) => {
        if (!from) throw new Error('From address must be provided');
        if (!recipient) throw new Error('Recipient address must be provided');
        const { psbt } = await toolbox.buildTx({
          ...rest,
          memo,
          feeOptionKey,
          recipient,
          feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
          sender: from,
          fetchTxHex: chain === Chain.Doge,
        });

        const txHex = await signTransaction(psbt, memo);
        return toolbox.broadcastTx(txHex);
      };

      const getAddress = async (path: DerivationPathArray = derivationPath) => {
        const { success, payload } = await //@ts-ignore
        (TrezorConnect as unknown as TrezorConnect.TrezorConnect).getAddress({
          path: `m/${derivationPathToString(path)}`,
          coin,
        });

        if (!success)
          throw new Error(
            'Failed to get address: ' +
              ((payload as { error: string; code?: string }).error || 'Unknown error'),
          );

        return payload.address;
      };

      const address = await getAddress();

      return {
        address,
        walletMethods: {
          ...toolbox,
          transfer,
          signTransaction,
          getAddress: () => address,
        },
      };
    }
    default:
      throw new Error('Chain not supported');
  }
};

const connectTrezor =
  ({
    apis,
    rpcUrls,
    addChain,
    config: {
      covalentApiKey,
      ethplorerApiKey = 'freekey',
      utxoApiKey,
      trezorManifest = { appUrl: '', email: '' },
    },
  }: ConnectWalletParams) =>
  async (chain: (typeof TREZOR_SUPPORTED_CHAINS)[number], derivationPath: DerivationPathArray) => {
    const trezorStatus = await //@ts-ignore
    (TrezorConnect as unknown as TrezorConnect.TrezorConnect).getDeviceState();
    if (!trezorStatus.success) {
      //@ts-ignore
      (TrezorConnect as unknown as TrezorConnect.TrezorConnect).init({
        lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
        manifest: trezorManifest,
      });
    }

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

export const trezorWallet = {
  connectMethodName: 'connectTrezor' as const,
  connect: connectTrezor,
  isDetected: () => true,
};

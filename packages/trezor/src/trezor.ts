import { Signer } from '@ethersproject/abstract-signer';
import { derivationPathToString } from '@thorswap-lib/helpers';
import { AVAXToolbox, BSCToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import {
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  UTXOTransferParams,
} from '@thorswap-lib/toolbox-utxo';
import { Chain, DerivationPathArray, WalletOption } from '@thorswap-lib/types';
import TrezorConnect from '@trezor/connect-web';
import { Psbt } from 'bitcoinjs-lib';

import { getEVMSigner } from './wallets/evm.js';

export const TREZOR_SUPPORTED_CHAINS = [
  Chain.Avalanche,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Doge,
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Litecoin,
] as const;

export const trezorTSParams = {
  lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
  manifest: {
    email: 'towan@thorswap.finance',
    appUrl: 'https://app.thorswap.finance',
  },
};

type TrezorOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
};

type Params = TrezorOptions & {
  chain: Chain;
  derivationPath: DerivationPathArray;
};

const getToolbox = async ({
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
      if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');
      if (!covalentApiKey) throw new Error('Ethplorer API key not found');

      const provider = getProvider(chain);
      const signer = (await getEVMSigner({ chain, derivationPath, provider })) as unknown as Signer;
      const address = await signer.getAddress();

      if (chain === Chain.Ethereum) {
        return {
          address,
          walletMethods: ETHToolbox({ signer, provider, ethplorerApiKey }),
        };
      }

      return {
        address,
        walletMethods: (chain === Chain.Avalanche ? AVAXToolbox : BSCToolbox)({
          signer,
          provider,
          covalentApiKey,
        }),
      };
    }

    case Chain.Bitcoin:
    case Chain.Doge:
    case Chain.Litecoin: {
      if (!utxoApiKey) throw new Error('UTXO API key not found');

      const toolbox = (
        chain === Chain.Bitcoin ? BTCToolbox : chain === Chain.Litecoin ? LTCToolbox : DOGEToolbox
      )(utxoApiKey);

      const signTransaction = async (psbt: Psbt) => {
        //@ts-ignore
        const result = await TrezorConnect.signTransaction({
          coin: chain.toLowerCase() as 'btc' | 'bch' | 'ltc' | 'doge',
          //@ts-ignore
          inputs: psbt.txInputs.map((input, index) => ({
            address_n: `m/${derivationPathToString(derivationPath)}`,
            prev_hash: input.hash.toString('hex'),
            prev_index: input.index,
            amount: psbt.data.inputs[index].witnessUtxo?.value || 0,
            script_type: 'EXTERNAL',
            script_pubkey: 'string',
          })),
          outputs: psbt.txOutputs.map((output) => {
            if (output.address === 'OP_RETURN') {
              return {
                op_return_data: 'deadbeef',
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
          return Psbt.fromHex(result.payload.serializedTx);
        } else {
          throw new Error(
            `Trezor failed to sign the Bitcoin transaction: ${
              (result.payload as { error: string; code?: string }).error
            }`,
          );
        }
      };

      const getAddress = async (path: DerivationPathArray = derivationPath) => {
        //@ts-ignore
        const { success, payload } = await TrezorConnect.getAddress({
          path: `m/${derivationPathToString(path)}`,
        });

        if (!success)
          throw new Error(
            'Failed to get address: ' +
              ((payload as { error: string; code?: string }).error || 'Unknown error'),
          );

        return payload.address;
      };

      return {
        address: await getAddress(),
        walletMethods: {
          ...toolbox,
          getAddress,
          transfer: (params: UTXOTransferParams) =>
            toolbox.transfer({ signTransaction, ...params }),
        },
      };
    }
    default:
      throw new Error('Chain not supported');
  }
};

const connectTrezor =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey = 'freekey', utxoApiKey },
  }: {
    addChain: any;
    config: TrezorOptions;
  }) =>
  async (chains: typeof TREZOR_SUPPORTED_CHAINS, derivationPath: DerivationPathArray) => {
    const promises = chains.map(async (chain) => {
      //@ts-ignore
      TrezorConnect.init({
        lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
        manifest: {
          email: 'towan@thorswap.finance',
          appUrl: 'https://app.thorswap.finance',
        },
      });

      const { address, walletMethods } = await getToolbox({
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
    });

    await Promise.all(promises);

    return true;
  };

export const trezorWallet = {
  connectMethodName: 'connectTrezor' as const,
  connect: connectTrezor,
  isDetected: () => true,
};

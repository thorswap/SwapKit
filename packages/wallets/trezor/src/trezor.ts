import { derivationPathToString } from '@swapkit/helpers';
import type { UTXOTransferParams, UTXOType } from '@swapkit/toolbox-utxo';
import type { ConnectWalletParams, DerivationPathArray } from '@swapkit/types';
import { Chain, FeeOption, WalletOption } from '@swapkit/types';
import TrezorConnect from '@trezor/connect-web';
import { toCashAddress } from 'bchaddrjs';
import type { Psbt } from 'bitcoinjs-lib';

import { getEVMSigner } from './signer/evm.ts';

export const TREZOR_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.BinanceSmartChain,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
] as const;

type TrezorOptions = {
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
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
  //TODO improve api typing
  api?: any;
};

const getToolbox = async ({
  api,
  rpcUrl,
  chain,
  ethplorerApiKey,
  covalentApiKey,
  derivationPath,
  blockchairApiKey,
}: Params) => {
  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error('Ethplorer API key not found');
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error('Covalent API key not found');

      const { getProvider, getToolboxByChain } = await import('@swapkit/toolbox-evm');

      const provider = getProvider(chain, rpcUrl);
      const signer = await getEVMSigner({ chain, derivationPath, provider });
      const address = await signer.getAddress();
      const toolbox = await getToolboxByChain(chain);

      return {
        address,
        walletMethods: {
          ...toolbox({
            covalentApiKey: covalentApiKey as string,
            api,
            signer,
            provider,
            ethplorerApiKey: ethplorerApiKey as string,
          }),
          getAddress: () => address,
        },
      };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      if (!blockchairApiKey && !api) throw new Error('UTXO API key not found');
      const coin = chain.toLowerCase() as 'btc' | 'bch' | 'ltc' | 'doge';

      const { getToolboxByChain, BCHToolbox } = await import('@swapkit/toolbox-utxo');

      const scriptType:
        | {
            input: 'SPENDWITNESS' | 'SPENDP2SHWITNESS' | 'SPENDADDRESS';
            output: 'PAYTOWITNESS' | 'PAYTOP2SHWITNESS' | 'PAYTOADDRESS';
          }
        | undefined =
        derivationPath[0] === 84
          ? { input: 'SPENDWITNESS', output: 'PAYTOWITNESS' }
          : derivationPath[0] === 49
            ? { input: 'SPENDP2SHWITNESS', output: 'PAYTOP2SHWITNESS' }
            : derivationPath[0] === 44
              ? { input: 'SPENDADDRESS', output: 'PAYTOADDRESS' }
              : undefined;

      if (!scriptType) throw new Error('Derivation path is not supported');
      const params = { apiClient: api, apiKey: blockchairApiKey, rpcUrl };

      const toolbox = (await getToolboxByChain(chain))(params);

      const getAddress = async (path: DerivationPathArray = derivationPath) => {
        const { success, payload } = await (
          TrezorConnect as unknown as TrezorConnect.TrezorConnect
        ).getAddress({
          path: `m/${derivationPathToString(path)}`,
          coin,
        });

        if (!success)
          throw new Error(
            'Failed to get address: ' +
              ((payload as { error: string; code?: string }).error || 'Unknown error'),
          );

        return chain === Chain.BitcoinCash
          ? (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(payload.address)
          : payload.address;
      };

      const address = await getAddress();

      const signTransaction = async (psbt: Psbt, inputs: UTXOType[], memo: string = '') => {
        const address_n = derivationPath.map((pathElement, index) =>
          index < 3 ? (pathElement | 0x80000000) >>> 0 : pathElement,
        );

        const result = await (
          TrezorConnect as unknown as TrezorConnect.TrezorConnect
        ).signTransaction({
          coin,
          inputs: inputs.map((input) => ({
            // Hardens the first 3 elements of the derivation path - required by trezor
            address_n,
            prev_hash: input.hash,
            prev_index: input.index,
            // object needs amount but does not use it for signing
            amount: input.value,
            script_type: scriptType.input,
          })),

          // Lint is not happy with the type of txOutputs
          outputs: psbt.txOutputs.map((output: any) => {
            const outputAddress =
              chain === Chain.BitcoinCash && output.address
                ? toCashAddress(output.address)
                : output.address;

            // Strip prefix from BCH address to compare with stripped address from Trezor
            const isChangeAddress =
              chain === Chain.BitcoinCash && outputAddress
                ? (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(outputAddress) === address
                : outputAddress === address;

            // OP_RETURN
            if (!output.address) {
              return {
                op_return_data: Buffer.from(memo).toString('hex'),
                amount: '0',
                script_type: 'PAYTOOPRETURN',
              };
            }

            // Change Address
            if (isChangeAddress) {
              return {
                address_n,
                amount: output.value,
                script_type: scriptType.output,
              };
            }

            // Outgoing UTXO
            return {
              address: outputAddress,
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

        const { psbt, inputs } = await toolbox.buildTx({
          ...rest,
          memo,
          recipient,
          feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
          sender: from,
          fetchTxHex: chain === Chain.Dogecoin,
        });

        const txHex = await signTransaction(psbt, inputs, memo);
        return toolbox.broadcastTx(txHex);
      };

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
      ethplorerApiKey,
      utxoApiKey,
      blockchairApiKey,
      trezorManifest = { appUrl: '', email: '' },
    },
  }: ConnectWalletParams) =>
  async (chain: (typeof TREZOR_SUPPORTED_CHAINS)[number], derivationPath: DerivationPathArray) => {
    const TConnect = TrezorConnect as unknown as TrezorConnect.TrezorConnect;
    const { success } = await TConnect.getDeviceState();

    if (!success) {
      TConnect.init({ lazyLoad: true, manifest: trezorManifest });
    }

    const { address, walletMethods } = await getToolbox({
      api: apis[chain],
      rpcUrl: rpcUrls[chain],
      chain,
      covalentApiKey,
      ethplorerApiKey,
      blockchairApiKey: blockchairApiKey || utxoApiKey,
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
};

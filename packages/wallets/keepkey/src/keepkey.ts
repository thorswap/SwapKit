import { Signer } from '@ethersproject/abstract-signer';
import { KeepKeySdk } from '@keepkey/keepkey-sdk';
import { addressInfoForCoin } from '@pioneer-platform/pioneer-coins';
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
  UTXO,
  WalletOption,
} from '@thorswap-lib/types';
import { toCashAddress } from 'bchaddrjs';
import { Psbt } from 'bitcoinjs-lib';

import { getEVMSigner } from './chains/evm.js';
import { thorchainWalletMethods } from './chains/thorchain.js';
import { cosmosWalletMethods } from './chains/cosmos.js';
import { binanceWalletMethods } from './chains/binance.js';

export const KEEPKEY_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Binance,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.THORChain,
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
  sdk: any;
  chain: Chain;
  derivationPath: DerivationPathArray;
  rpcUrl?: string;
  api?: any;
};

const getToolbox = async (params: Params) => {
  const { sdk, api, rpcUrl, chain, ethplorerApiKey, covalentApiKey, derivationPath, utxoApiKey } =
    params;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      const provider = getProvider(chain, rpcUrl || '');
      const signer = (await getEVMSigner({ sdk, chain, derivationPath, provider })) as Signer;
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
    }
    case Chain.Binance: {
      const walletMethods = await binanceWalletMethods({ sdk, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Cosmos: {
      const walletMethods = await cosmosWalletMethods({ sdk, api, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.THORChain: {
      const walletMethods = await thorchainWalletMethods({ sdk, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      if (!utxoApiKey && !api) throw new Error('UTXO API key not found');
      const coin = chain.toLowerCase() as 'btc' | 'bch' | 'ltc' | 'doge';
      console.log('coin: ', coin);

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

      const utxoMethods = toolbox(utxoApiKey || '', api);

      //getAddress
      const getAddress = async function (coin: string) {
        try {
          //TODO custom script types?
          let addressInfo = addressInfoForCoin(coin, false, 'p2wkh');
          let response = await sdk.address.utxoGetAddress(addressInfo);
          return response.address;
        } catch (e) {
          console.error(e);
        }
      };
      const address = await getAddress(coin);
      const signTransaction = async (psbt: Psbt, inputs: UTXO[], memo: string = '') => {
        const address_n = derivationPath.map((pathElement, index) =>
          index < 3 ? (pathElement | 0x80000000) >>> 0 : pathElement,
        );

        let outputs = psbt.txOutputs.map((output: any) => {
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
              // @ts-ignore
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
        });

        let txToSign = {
          coin: 'Bitcoin',
          inputs,
          outputs,
          version: 1,
          locktime: 0,
        };
        console.log('txToSign: ', txToSign);
        let responseSign = await sdk.utxo.utxoSignTransaction(txToSign);

        return responseSign.serialized;
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
          feeOptionKey,
          recipient,
          feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
          sender: from,
          fetchTxHex: chain === Chain.Dogecoin,
        });

        const txHex = await signTransaction(psbt, inputs, memo);
        console.log('txHex: ', txHex);
        return toolbox.broadcastTx(txHex);
      };

      return {
        address,
        walletMethods: { ...utxoMethods, getAddress, signTransaction, transfer },
      };
    }
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
    const spec = 'http://localhost:1646/spec/swagger.json';
    const apiKey = localStorage.getItem('apiKey') || '1234';
    const config: any = {
      apiKey,
      pairingInfo: {
        name: 'swapKit-demo-app',
        imageUrl: 'https://thorswap.finance/assets/img/header_logo.png',
        basePath: spec,
        url: 'http://localhost:1646',
      },
    };
    // init
    const sdk = await KeepKeySdk.create(config);
    if (config.apiKey !== apiKey) localStorage.setItem('apiKey', config.apiKey);

    const { address, walletMethods } = await getToolbox({
      sdk,
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
      wallet: { address, balance: [], walletType: WalletOption.KEEPKEY },
    });

    return true;
  };

export const keepkeyWallet = {
  connectMethodName: 'connectKeepKey' as const,
  connect: connectKeepKey,
  isDetected: () => true,
};

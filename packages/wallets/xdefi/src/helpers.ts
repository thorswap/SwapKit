import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import {
  BinanceToolbox,
  BinanceToolboxType,
  createCosmJS,
  DEFAULT_GAS_VALUE,
  GaiaToolbox,
  GaiaToolboxType,
  ThorchainToolbox,
  ThorchainToolboxType,
} from '@thorswap-lib/toolbox-cosmos';
import {
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  prepareNetworkSwitch,
} from '@thorswap-lib/toolbox-evm';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import {
  Chain,
  ChainId,
  ChainToChainId,
  EVMTxParams,
  FeeOption,
  WalletTxParams,
} from '@thorswap-lib/types';

import { XDEFIConfig } from './types.js';
import { transfer } from './walletHelpers.js';

// TODO: Fix type inference: swapkit-entities, bitcoinjs-lib, ecpair
export const getWalletMethodsForChain: any = ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
  rpcUrl,
  api,
}: { rpcUrl?: string; api?: any; chain: Chain } & XDEFIConfig) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      if (!window.xfi?.ethereum) throw new Error('XDEFI wallet is not installed');

      if (!covalentApiKey && !ethplorerApiKey) {
        throw new Error(`Missing API key for ${chain} chain`);
      }

      // TODO: Use RPCUrl from config
      const provider = new Web3Provider(window.xfi?.ethereum, 'any');

      const toolboxParams = {
        provider,
        // TODO: check on web3 signer type
        signer: provider.getSigner() as any,
        ethplorerApiKey: ethplorerApiKey as string,
        covalentApiKey: covalentApiKey as string,
      };

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox(toolboxParams)
          : chain === Chain.Avalanche
          ? AVAXToolbox(toolboxParams)
          : BSCToolbox(toolboxParams);

      const sendTransaction = async (tx: EVMTxParams, feeOptionKey: FeeOption) => {
        const address = await provider.getSigner().getAddress();
        const feeData = (await toolbox.estimateGasPrices())[feeOptionKey];
        const nonce = tx.nonce || (await provider.getTransactionCount(address));
        const chainId = (await provider.getNetwork()).chainId;

        let gasLimit: BigNumber;
        try {
          gasLimit = (await provider.estimateGas(tx)).mul(110).div(100);
        } catch (error) {
          throw new Error(`Error estimating gas limit: ${JSON.stringify(error)}`);
        }
        try {
          const { value, ...transaction } = tx;
          const parsedValue = {
            ...transaction,
            chainId,
            type: chain !== Chain.BinanceSmartChain ? 2 : 0,
            gasLimit: gasLimit.toHexString(),
            gasPrice: 'gasPrice' in feeData ? feeData.gasPrice?.toHexString() : undefined,
            maxFeePerGas: feeData.maxFeePerGas?.toHexString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toHexString(),
            nonce,
            ...(!BigNumber.from(value || 0).isZero() ? { value } : {}),
          };
          return toolbox.EIP1193SendTransaction(parsedValue);
        } catch (error) {
          throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
        }
      };

      return prepareNetworkSwitch({
        toolbox: { ...toolbox, sendTransaction },
        chainId: ChainToChainId[chain],
        provider: window.xfi?.ethereum,
      });
    }

    case Chain.THORChain: {
      const toolbox = ThorchainToolbox({});

      return {
        ...toolbox,
        deposit: (tx: WalletTxParams) => transfer({ ...tx, recipient: '' }, 'deposit'),
        transfer: (tx: WalletTxParams) =>
          transfer({ ...tx, gasLimit: DEFAULT_GAS_VALUE }, 'transfer'),
      } as unknown as ThorchainToolboxType;
    }

    case Chain.Cosmos: {
      const toolbox = GaiaToolbox({ server: api });

      const transfer = async ({ from, recipient, amount, asset, memo }: any) => {
        const keplrClient = window.xfi?.keplr;
        const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);

        const cosmJS = await createCosmJS({ offlineSigner, rpcUrl });

        const coins = [
          {
            denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom',
            amount: amount.amount().toString(),
          },
        ];

        const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 'auto', memo);
        return transactionHash;
      };

      return { ...toolbox, transfer } as unknown as GaiaToolboxType;
    }

    case Chain.Binance: {
      // @cosmos-client/core Type Inference issue
      const toolbox = BinanceToolbox({});

      return { ...toolbox, transfer } as unknown as BinanceToolboxType;
    }

    case Chain.Bitcoin:
      return { ...BTCToolbox(utxoApiKey, rpcUrl), transfer };

    case Chain.BitcoinCash:
      return { ...BCHToolbox(utxoApiKey, rpcUrl), transfer };

    case Chain.Dogecoin:
      return { ...DOGEToolbox(utxoApiKey, rpcUrl), transfer };

    case Chain.Litecoin:
      return { ...LTCToolbox(utxoApiKey, rpcUrl), transfer };

    default:
      return null;
  }
};

import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { baseAmount } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { BinanceToolbox, GaiaToolbox, ThorchainToolbox } from '@thorswap-lib/toolbox-cosmos';
import { AVAXToolbox, BSCToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import { BCHToolbox, BTCToolbox, DOGEToolbox, LTCToolbox } from '@thorswap-lib/toolbox-utxo';
import {
  BaseDecimal,
  Chain,
  ChainId,
  ChainToChainId,
  EIP1559TxParams,
  FeeOption,
  RPCUrl,
  TxHash,
  WalletTxParams,
} from '@thorswap-lib/types';

import { prepareNetworkSwitch } from '../evmWallet/walletMethods/helpers/methodWrappers.js';
import { XDEFIConfig } from '../types.js';

type TransactionMethod = 'eth_signTransaction' | 'eth_sendTransaction' | 'transfer' | 'deposit';

type TransactionParams = {
  asset: string;
  amount: number | string;
  decimal: number;
  recipient: string;
  memo?: string;
};

const getXDEFIProvider = (chain: Chain) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
      return window.xfi?.ethereum;
    case Chain.Binance:
      return window.xfi?.binance;
    case Chain.Bitcoin:
      return window.xfi?.bitcoin;
    case Chain.BitcoinCash:
      return window.xfi?.bitcoincash;
    case Chain.Doge:
      return window.xfi?.dogecoin;
    case Chain.Litecoin:
      return window.xfi?.litecoin;
    case Chain.THORChain:
      return window.xfi?.thorchain;
    case Chain.Cosmos:
      return window.keplr;
  }
};

const getUTXOToolbox = ({ chain, utxoApiKey }: { chain: Chain; utxoApiKey: string }) => {
  switch (chain) {
    case Chain.Bitcoin:
      return BTCToolbox(utxoApiKey);
    case Chain.BitcoinCash:
      return BCHToolbox(utxoApiKey);
    case Chain.Doge:
      return DOGEToolbox(utxoApiKey);
    case Chain.Litecoin:
      return LTCToolbox(utxoApiKey);
    default:
      throw new Error('Unsupported chain');
  }
};

const transaction = async ({
  method,
  params,
  chain,
}: {
  method: TransactionMethod;
  params: TransactionParams[] | any;
  chain: Chain;
}): Promise<TxHash> => {
  const client = method === 'deposit' ? window.xfi?.thorchain : getXDEFIProvider(chain);

  return new Promise<TxHash>((resolve, reject) => {
    client.request({ method, params }, (err: any, tx: string) => (err ? reject(err) : resolve(tx)));
  });
};

const transfer = async (
  { amount, asset, recipient, memo }: WalletTxParams,
  method: TransactionMethod = 'transfer',
) => {
  if (!asset) throw new Error('Asset is not defined');

  /**
   * EVM requires amount to be hex string
   * UTXO/Cosmos requires amount to be number
   */
  const parsedAmount =
    method === 'eth_sendTransaction' ? amount.amount().toHexString() : amount.amount().toNumber();

  const from = await getXDEFIAddress(asset.chain);
  const params = [
    { amount: { amount: parsedAmount, decimals: amount.decimal }, asset, from, memo, recipient },
  ];

  return transaction({ method, params, chain: asset.chain });
};

export const getWalletMethodsForChain = ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  utxoApiKey,
}: { chain: Chain } & XDEFIConfig) => {
  switch (chain) {
    case Chain.Ethereum:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche: {
      if (!ethplorerApiKey) throw new Error('Ethplorer API key is not defined');
      if (!covalentApiKey) throw new Error(`${chain} API key is not defined`);
      if (!window.xfi?.ethereum) throw new Error('XDEFI wallet is not installed');

      const provider = new Web3Provider(window.xfi?.ethereum, 'any');

      const balanceProvider = getProvider(chain);

      const toolboxParams = {
        provider,
        signer: provider.getSigner(),
        ethplorerApiKey,
        covalentApiKey,
      };

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox(toolboxParams)
          : chain === Chain.Avalanche
          ? AVAXToolbox(toolboxParams)
          : BSCToolbox(toolboxParams);

      const sendTransaction = async (tx: EIP1559TxParams, feeOptionKey: FeeOption) => {
        const address = await provider.getSigner().getAddress();
        const feeData = await toolbox.getFeeData(feeOptionKey);
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
            type: 2,
            gasLimit: gasLimit.toHexString(),
            maxFeePerGas: feeData.maxFeePerGas.toHexString(),
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.toHexString(),
            nonce,
            ...(value && !BigNumber.from(value).isZero() ? { value } : {}),
          };
          return toolbox.EIP1193SendTransaction(parsedValue);
        } catch (error) {
          throw new Error(`Error sending transaction: ${JSON.stringify(error)}`);
        }
      };

      const getBalance = async (address: string, assets?: AssetEntity[]) => {
        const evmGasTokenBalance: BigNumber = await balanceProvider.getBalance(address);
        const evmGasTokenBalanceAmount = baseAmount(evmGasTokenBalance, BaseDecimal[chain]);
        return [
          {
            asset:
              chain === Chain.Ethereum
                ? AssetEntity.ETH()
                : chain === Chain.Avalanche
                ? AssetEntity.AVAX()
                : AssetEntity.BSC(),
            amount: evmGasTokenBalanceAmount,
          },
          ...(await toolbox.getBalance(address, assets)).slice(1),
        ];
      };

      return prepareNetworkSwitch({
        toolbox: { ...toolbox, sendTransaction, getBalance },
        chainId: ChainToChainId[chain],
        provider: window.xfi?.ethereum,
      });
    }

    case Chain.THORChain: {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars, prettier/prettier
        createMultisig, exportMultisigTx, exportSignature, importSignature, importMultisigTx, mergeSignatures, getMultisigAddress, createKeyPair, getAccAddress, getAccount, getAddressFromMnemonic, instanceToProto, sdk, signAndBroadcast,
        ...toolbox
      } = ThorchainToolbox({});

      return {
        ...toolbox,
        transfer,
        deposit: (tx: WalletTxParams) => transfer({ ...tx, recipient: '' }, 'deposit'),
      };
    }

    case Chain.Cosmos: {
      const toolbox = GaiaToolbox();

      const transfer = async ({ from, recipient, amount, asset, memo }: any) => {
        const keplrClient = window.keplr;
        const offlineSigner = keplrClient?.getOfflineSignerOnlyAmino(ChainId.Cosmos);

        const cosmJS = await SigningStargateClient.connectWithSigner(RPCUrl.Cosmos, offlineSigner, {
          gasPrice: GasPrice.fromString('0.0003uatom'),
        });

        const coins = [
          {
            denom: asset?.symbol === 'MUON' ? 'umuon' : 'uatom',
            amount: amount.amount().toString(),
          },
        ];

        const { transactionHash } = await cosmJS.sendTokens(from, recipient, coins, 'auto', memo);
        return transactionHash;
      };

      return { ...toolbox, transfer };
    }

    case Chain.Binance: {
      // @cosmos-client/core Type Inference issue
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars, prettier/prettier
        createKeyPair, getAddressFromMnemonic, sdk, getAccount, signAndBroadcast,
        ...toolbox
      } = BinanceToolbox({});

      return { ...toolbox, transfer };
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Doge:
    case Chain.Litecoin: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      return { ...getUTXOToolbox({ chain, utxoApiKey }), transfer };
    }

    default:
      return null;
  }
};

/**
 * We handle both EVM and other chains at once
 */
export const getXDEFIAddress = async (chain: Chain) => {
  const provider = getXDEFIProvider(chain);
  if (!provider) throw new Error('XDEFI provider is not defined');

  if (chain === Chain.Cosmos) {
    // Enabling before using the Keplr is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    await provider.enable(ChainId.Cosmos);

    const offlineSigner = provider.getOfflineSigner(ChainId.Cosmos);

    const [{ address }] = await offlineSigner.getAccounts();

    return address;
  } else if ([Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain)) {
    const response = await provider.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    return response[0];
  } else {
    return new Promise((resolve, reject) =>
      provider.request(
        { method: 'request_accounts', params: [] },
        (error: any, response: string[]) => (error ? reject(error) : resolve(response[0])),
      ),
    );
  }
};

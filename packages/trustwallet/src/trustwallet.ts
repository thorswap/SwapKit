import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { getTcChainId } from '@thorswap-lib/helpers';
import {
  BinanceToolbox,
  DepositParam,
  getDenomWithChain,
  ThorchainToolbox,
} from '@thorswap-lib/toolbox-cosmos';
import { ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import {
  Chain,
  ChainId,
  EIP1559TxParams,
  NetworkId,
  WalletOption,
  WalletTxParams,
} from '@thorswap-lib/types';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import type { IConnector, IWalletConnectOptions } from '@walletconnect/types';
import { auth, StdTx } from 'cosmos-client/x/auth/index.js';

import { errorCodes } from './constants.js';
import { buildTransferMsg, getAccounts, getAddressByChain } from './helpers.js';
import { IAccount, WalletConnectOption } from './types.js';

const SUPPORTED_CHAINS = [Chain.Binance, Chain.Ethereum, Chain.THORChain] as const;
const THORCHAIN_DEFAULT_GAS_FEE = '500000000';

const fee = {
  amounts: [],
  gas: THORCHAIN_DEFAULT_GAS_FEE,
};

//TODO fix transaction object typing
const parseEvmTxToWalletconnect = (transaction: EIP1559TxParams) => {
  if (!transaction.from || !transaction.to) throw new Error('invalid transaction');
  return {
    from: transaction.from.toLowerCase(),
    to: transaction.to.toLowerCase(),
    data: transaction.data || undefined,
    value: BigNumber.from(transaction.value || 0).toHexString(),
  };
};

const getToolbox = async ({
  chain,
  ethplorerApiKey,
  address,
  stagenet,
  walletconnectClient,
}: {
  walletconnectClient: IConnector;
  stagenet?: boolean;
  chain: (typeof SUPPORTED_CHAINS)[number];
  ethplorerApiKey?: string;
  address: string;
}) => {
  const from = address;

  switch (chain) {
    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');

      const provider = getProvider(chain);

      const signer = {
        signTransaction: async (transaction: EIP1559TxParams) => {
          const signedTx = await walletconnectClient.signTransaction(
            parseEvmTxToWalletconnect(transaction),
          );
          return signedTx.startsWith('0x') ? signedTx : `0x${signedTx}`;
        },
        getAddress: async () => address,
        _isSigner: true,
        sendTransaction: async (tx: EIP1559TxParams) => {
          const signedTx = await walletconnectClient.signTransaction(parseEvmTxToWalletconnect(tx));
          // Workaround cause trustwallet iOS doesn't return hex string with prefix 0x, android does
          return provider.sendTransaction(signedTx.startsWith('0x') ? signedTx : `0x${signedTx}`);
        },
      } as unknown as Signer;

      return ETHToolbox({
        provider,
        signer,
        ethplorerApiKey,
      });
    }

    case Chain.THORChain: {
      const toolbox = ThorchainToolbox({ stagenet });

      const deposit = async ({ asset, memo, amount }: DepositParam) => {
        const account = await toolbox.getAccount(from);
        if (!account) throw new Error('invalid account');
        if (!asset) throw new Error('invalid asset to deposit');

        const sequence = account.sequence?.toString() || '0';

        const tx = {
          accountNumber: account.account_number?.low,
          chainId: getTcChainId(),
          fee,
          memo: '',
          sequence,
          messages: [
            {
              rawJsonMessage: {
                type: 'thorchain/MsgDeposit',
                value: JSON.stringify({
                  memo,
                  coins: [
                    {
                      asset: getDenomWithChain(asset).toUpperCase(),
                      amount: amount.amount().toString(),
                    },
                  ],
                  signer: address,
                }),
              },
            },
          ],
        };

        const signedTx = await walletconnectClient.sendCustomRequest({
          jsonrpc: '2.0',
          method: 'trust_signTransaction',
          params: [{ network: NetworkId.THORChain, transaction: JSON.stringify(tx) }],
        });

        const signedTxObj = JSON.parse(signedTx);

        if (!signedTxObj?.tx) throw new Error('tx signing failed');

        // insert sequence to signedTx Object
        signedTxObj.tx.signatures[0].sequence = String(sequence);
        signedTxObj.tx.fee = fee;

        // @ts-ignore newer version of cosmos-client
        const { data } = await auth.txsPost(toolbox.sdk, StdTx.fromJSON(signedTxObj.tx), 'block');

        return data?.txhash || '';
      };

      const transfer = async ({ asset, amount, recipient, memo }: WalletTxParams) => {
        const account = await toolbox.getAccount(from);
        if (!account) throw new Error('invalid account');
        if (!asset) throw new Error('invalid asset');

        const { account_number: accountNumber, sequence = '0' } = account;

        const message = {
          sendCoinsMessage: {
            fromAddress: from,
            toAddress: recipient,
            amounts: [{ denom: asset?.symbol.toLowerCase(), amount: amount.amount().toString() }],
          },
        };

        // get tx signing msg
        const signRequestMsg = {
          accountNumber: accountNumber?.toString(),
          chainId: getTcChainId(),
          fee,
          memo: memo || '',
          sequence: sequence?.toString(),
          messages: [message],
        };

        const signedTx = await walletconnectClient.sendCustomRequest({
          jsonrpc: '2.0',
          method: 'trust_signTransaction',
          params: [{ network: NetworkId.THORChain, transaction: JSON.stringify(signRequestMsg) }],
        });

        // broadcast raw tx

        const signedTxObj = JSON.parse(signedTx);

        if (!signedTxObj?.tx) throw new Error('tx signing failed');

        // insert sequence to signedTx Object
        signedTxObj.tx.signatures[0].sequence = String(sequence);

        const stdTx = StdTx.fromJSON(signedTxObj.tx);

        // @ts-ignore newer version of cosmos-client
        const { data } = await auth.txsPost(toolbox.sdk, stdTx, 'block');

        // return tx hash
        return data?.txhash || '';
      };

      return { ...toolbox, deposit, transfer };
    }
    case Chain.Binance: {
      const toolbox = BinanceToolbox({ stagenet });

      const transfer = async ({ asset, amount, recipient, memo = '' }: WalletTxParams) => {
        const account = await toolbox.getAccount(from);
        if (!account) throw new Error('invalid account');
        if (!asset) throw new Error('invalid asset');

        const accountNumber = account.account_number.toString();
        const sequence = account.sequence.toString();
        const txParam = {
          fromAddress: from,
          toAddress: recipient,
          denom: asset?.symbol,
          amount: amount.amount().toNumber(),
        };

        const signedTx = await walletconnectClient.sendCustomRequest({
          jsonrpc: '2.0',
          method: 'trust_signTransaction',
          params: [
            {
              network: NetworkId.Binance,
              transaction: JSON.stringify({
                accountNumber,
                chainId: ChainId.Binance,
                sequence,
                memo,
                send_order: buildTransferMsg(txParam),
              }),
            },
          ],
        });

        const res: any = await toolbox.sendRawTransaction(signedTx, true);

        return res[0]?.hash;
      };

      return { ...toolbox, transfer };
    }
  }
};

let walletConnectAccounts: IAccount[];
const getWalletconnect = async (walletconnectOptions: WalletConnectOption = {}) => {
  const options: IWalletConnectOptions = {
    bridge: 'https://polygon.bridge.walletconnect.org',
    // @ts-ignore walletconnet types issue
    qrcodeModal: QRCodeModal,
    qrcodeModalOptions: { mobileLinks: ['trust'] },
    ...walletconnectOptions?.options,
  };

  const listeners = walletconnectOptions?.listeners;
  localStorage.removeItem('walletconnect');

  // @ts-expect-error
  const connector = new WalletConnect(options) as unknown as WalletConnect.default;

  if (!connector.connected) {
    // create new session (display QR code inside createSession as well)
    await connector.createSession();
  }

  if (!connector) {
    throw new Error(errorCodes.ERROR_SESSION_DISCONNECTED);
  }

  await new Promise((resolve, reject) => {
    connector.on('connect', async (error: any) => {
      if (error) reject(error);

      // @ts-ignore walletconnet types issue
      QRCodeModal.close();
      walletConnectAccounts = await getAccounts(connector);
      resolve(walletConnectAccounts);
    });

    connector.on('disconnect', (error: any) => {
      if (error) reject(error);

      listeners?.disconnect?.();
    });
  });

  return connector;
};

const connectTrustwallet =
  ({
    addChain,
    config: { ethplorerApiKey },
  }: {
    addChain: any;
    config: { ethplorerApiKey?: string };
  }) =>
  async (
    chains: (typeof SUPPORTED_CHAINS)[number][],
    walletconnectOptions?: WalletConnectOption,
  ) => {
    const chainsToConnect = chains.filter((chain) => SUPPORTED_CHAINS.includes(chain));
    const walletconnectClient: IConnector = await getWalletconnect(walletconnectOptions);

    const promises = chainsToConnect.map(async (chain) => {
      const address = getAddressByChain(chain, walletConnectAccounts);
      const getAddress = () => address;

      const toolbox = await getToolbox({
        walletconnectClient,
        address,
        chain,
        ethplorerApiKey,
      });

      addChain({
        chain,
        walletMethods: { ...toolbox, getAddress },
        wallet: { address, balance: [], walletType: WalletOption.TRUSTWALLET },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const walletconnectWallet = {
  connectMethodName: 'connectTrustwallet' as const,
  connect: connectTrustwallet,
  isDetected: () => true,
};

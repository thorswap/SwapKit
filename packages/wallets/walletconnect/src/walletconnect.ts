import { Signer } from '@ethersproject/abstract-signer';
import { hexlify } from '@ethersproject/bytes';
import { toUtf8Bytes } from '@ethersproject/strings';
import { AVAXToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import { Chain, WalletOption } from '@thorswap-lib/types';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Client from '@walletconnect/sign-client';
import type { SessionTypes, SignClientTypes } from '@walletconnect/types';

import {
  DEFAULT_APP_METADATA,
  DEFAULT_EIP155_METHODS,
  DEFAULT_LOGGER,
  DEFAULT_RELAY_URL,
} from './constants.js';
import { chainToChainId, getAddressByChain } from './helpers.js';
import { getRequiredNamespaces } from './namespaces.js';

const SUPPORTED_CHAINS = [Chain.Binance, Chain.Ethereum, Chain.THORChain, Chain.Avalanche] as const;

const getToolbox = async ({
  chain,
  ethplorerApiKey,
  covalentApiKey,
  address,
  walletconnectClient,
  session,
}: {
  // @ts-ignore
  walletconnectClient: Client;
  session: SessionTypes.Struct;
  chain: (typeof SUPPORTED_CHAINS)[number];
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  address: string;
}) => {
  const from = address;

  switch (chain) {
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error('Ethplorer API key not found');
      if (!covalentApiKey) throw new Error('Covalent API key not found');

      const provider = getProvider(chain);

      const toolbox =
        chain === Chain.Ethereum
          ? ETHToolbox({
              provider,
              ethplorerApiKey,
            })
          : AVAXToolbox({
              provider,
              covalentApiKey,
              signer: undefined as unknown as Signer,
            });

      const transfer = async (params: any) => {
        const txAmount = params.amount.amount().toHexString();
        const gasLimit = (
          await toolbox.estimateGasLimit({
            asset: params.asset,
            recipient: params.recipient,
            amount: params.amount,
            memo: params.memo,
          })
        ).toHexString();
        const gasPrice = (await toolbox.estimateGasPrices()).fast.maxFeePerGas?.toHexString();
        const txHash: string = await walletconnectClient.request({
          chainId: chainToChainId(chain),
          topic: session.topic,
          request: {
            method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
            params: [
              {
                from,
                to: params.recipient,
                data: params.memo ? hexlify(toUtf8Bytes(params.memo)) : '0x',
                gasPrice,
                gasLimit,
                value: txAmount,
              },
            ],
          },
        });
        return txHash;
      };

      return { ...toolbox, transfer };
    }
    default:
      throw new Error('Chain is not supported');
  }
};

const getWalletconnect = async (
  chains: Chain[],
  walletConnectProjectId?: string,
  walletconnectOptions?: SignClientTypes.Options,
) => {
  try {
    const requiredNamespaces = getRequiredNamespaces(chains.map(chainToChainId));

    // @ts-ignore
    const client = await Client.init({
      logger: DEFAULT_LOGGER,
      relayUrl: DEFAULT_RELAY_URL,
      projectId: walletConnectProjectId,
      metadata: walletconnectOptions?.metadata || DEFAULT_APP_METADATA,
      ...walletconnectOptions?.core,
    });

    const { uri, approval } = await client.connect({
      requiredNamespaces,
    });

    // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
    if (uri) {
      // @ts-ignore
      QRCodeModal.open(uri, () => {
        console.log('EVENT', 'QR Code Modal closed');
      });
    }

    const session = await approval();
    const accounts = Object.values(session.namespaces)
      .map((namespace: any) => namespace.accounts)
      .flat();

    return { session, accounts, client };
  } catch (e) {
    console.error(e);
  } finally {
    // @ts-ignore
    QRCodeModal.close();
  }
  return undefined;
};

const connectWalletconnect =
  ({
    addChain,
    config: { ethplorerApiKey, walletConnectProjectId, covalentApiKey },
  }: {
    addChain: any;
    config: {
      covalentApiKey?: string;
      ethplorerApiKey?: string;
      walletConnectProjectId?: string;
    };
  }) =>
  async (
    chains: (typeof SUPPORTED_CHAINS)[number][],
    walletconnectOptions?: SignClientTypes.Options,
  ) => {
    const chainsToConnect = chains.filter((chain) => SUPPORTED_CHAINS.includes(chain));
    const walletconnect = await getWalletconnect(
      chainsToConnect,
      walletConnectProjectId,
      walletconnectOptions,
    );

    if (!walletconnect) throw new Error('Unable to establish connection through walletconnect');

    const { session, accounts, client } = walletconnect;

    const promises = chainsToConnect.map(async (chain) => {
      const address = getAddressByChain(chain, accounts);
      const getAddress = () => address;

      const toolbox = await getToolbox({
        walletconnectClient: client,
        session,
        address,
        chain,
        ethplorerApiKey,
        covalentApiKey,
      });

      addChain({
        chain,
        walletMethods: { ...toolbox, getAddress },
        wallet: { address, balance: [], walletType: WalletOption.WALLETCONNECT },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const walletconnectWallet = {
  connectMethodName: 'connectWalletconnect' as const,
  connect: connectWalletconnect,
  isDetected: () => true,
};

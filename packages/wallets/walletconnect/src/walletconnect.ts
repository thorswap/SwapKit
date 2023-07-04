import { AVAXToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import { Chain, WalletOption } from '@thorswap-lib/types';
import QRCodeModal from '@walletconnect/qrcode-modal';
import Client, { type SignClient } from '@walletconnect/sign-client';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';

import {
  DEFAULT_APP_METADATA,
  DEFAULT_LOGGER,
  DEFAULT_RELAY_URL,
  WC_SUPPORTED_CHAINS,
} from './constants.js';
import { getEVMSigner } from './evmSigner.js';
import { chainToChainId } from './helpers.js';
import { getRequiredNamespaces } from './namespaces.js';

// const getToolbox = async ({
//   chain,
//   ethplorerApiKey,
//   covalentApiKey,
//   address,
//   walletconnectClient,
//   session,
// }: {
//   // @ts-ignore
//   walletconnectClient: Client;
//   session: SessionTypes.Struct;
//   chain: (typeof SUPPORTED_CHAINS)[number];
//   covalentApiKey?: string;
//   ethplorerApiKey?: string;
//   address: string;
// }) => {
//   const from = address;

//   switch (chain) {
//     case Chain.Avalanche:
//     case Chain.BinanceSmartChain:
//     case Chain.Ethereum: {
//       const provider = getProvider(chain);

//       const signer = {
//         getAddress: async () => address,
//         _isSigner: true,
//         sendTransaction: async (tx: EIP1559TxParams) => {
//           const txHash: string = await walletconnectClient.request({
//             chainId: chainToChainId(chain),
//             topic: session.topic,
//             request: {
//               method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
//               params: [
//                 {
//                   from,
//                   to: tx.to?.toLocaleLowerCase(),
//                   data: tx.data || undefined,
//                   value: BigNumber.from(tx.value || 0).toHexString(),
//                 },
//               ],
//             },
//           });
//           return txHash;
//         },
//       } as unknown as Signer;

//       return toolbox;
//     }
//     default:
//       throw new Error('Chain is not supported');
//   }
// };

const getWalletconnect = async (
  chains: Chain[],
  walletConnectProjectId?: string,
  walletconnectOptions?: SignClientTypes.Options,
): Promise<{
  session: SessionTypes.Struct;
  accounts: string[];
  client: InstanceType<typeof SignClient>;
}> => {
  try {
    const requiredNamespaces = getRequiredNamespaces(chains.map(chainToChainId));
    //@ts-ignore
    const client = await (Client as typeof Client.SignClient).init({
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
      (QRCodeModal as typeof QRCodeModal.default).open(uri, () => {
        console.log('EVENT', 'QR Code Modal closed');
      });
    }

    const session = await approval();
    const accounts = Object.values<SessionTypes.Namespace>(session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();

    //@ts-ignore
    return { session, accounts, client };
  } catch (e) {
    throw new Error('Unable to establish connection through walletconnect');
  } finally {
    // @ts-ignore
    (QRCodeModal as typeof QRCodeModal.default).close();
  }
};

export type Walletconnect = Awaited<ReturnType<typeof getWalletconnect>>;

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
    chains: (typeof WC_SUPPORTED_CHAINS)[number][],
    walletconnectOptions?: SignClientTypes.Options,
  ) => {
    const chainsToConnect = chains.filter((chain) => WC_SUPPORTED_CHAINS.includes(chain));
    const walletconnect = await getWalletconnect(
      chainsToConnect,
      walletConnectProjectId,
      walletconnectOptions,
    );

    const promises = chainsToConnect.map(async (chain) => {
      if (
        chain === Chain.Avalanche ||
        chain === Chain.BinanceSmartChain ||
        chain === Chain.Ethereum
      ) {
        // TODO improve check if keys are set
        if (chain === Chain.Ethereum && !ethplorerApiKey)
          throw new Error('Ethplorer API key not found');
        if (chain !== Chain.Ethereum && !covalentApiKey)
          throw new Error('Covalent API key not found');

        // TODO(@0xGeneral): Check on typings
        const provider = getProvider(chain) as unknown as any;
        const signer = await getEVMSigner({ walletconnect, chain, provider });
        const toolbox =
          chain === Chain.Ethereum && ethplorerApiKey
            ? ETHToolbox({
                provider,
                signer,
                ethplorerApiKey,
              })
            : covalentApiKey
            ? AVAXToolbox({
                provider,
                signer,
                covalentApiKey,
              })
            : undefined;

        const address = await signer.getAddress();

        addChain({
          chain,
          walletMethods: { ...toolbox, getAddress: () => address },
          wallet: { address, balance: [], walletType: WalletOption.WALLETCONNECT },
        });
        return;
      }
      throw new Error('Chain is not supported');
    });

    await Promise.all(promises);

    return true;
  };

export const walletconnectWallet = {
  connectMethodName: 'connectWalletconnect' as const,
  connect: connectWalletconnect,
  isDetected: () => true,
};

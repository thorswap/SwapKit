import type { StdSignDoc } from "@cosmjs/amino";
import {
  Chain,
  ChainId,
  type ConnectWalletParams,
  RPCUrl,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import type { BaseCosmosToolboxType, DepositParam, TransferParams } from "@swapkit/toolbox-cosmos";
import type { WalletConnectModalSign } from "@walletconnect/modal-sign-html";
import type { SessionTypes, SignClientTypes } from "@walletconnect/types";

import {
  BINANCE_MAINNET_ID,
  DEFAULT_APP_METADATA,
  DEFAULT_COSMOS_METHODS,
  DEFAULT_LOGGER,
  DEFAULT_RELAY_URL,
  THORCHAIN_MAINNET_ID,
  WC_SUPPORTED_CHAINS,
} from "./constants.ts";
import { getEVMSigner } from "./evmSigner.ts";
import { chainToChainId, getAddressByChain } from "./helpers.ts";
import { getRequiredNamespaces } from "./namespaces.ts";

const SUPPORTED_CHAINS = [
  Chain.Binance, // Not supported by WC
  Chain.BinanceSmartChain,
  Chain.Ethereum,
  Chain.THORChain,
  Chain.Avalanche,
  Chain.Arbitrum,
  Chain.Optimism,
  Chain.Polygon,
  Chain.Maya,
  Chain.Cosmos,
  Chain.Kujira,
] as const;

async function getToolbox({
  chain,
  ethplorerApiKey,
  covalentApiKey = "",
  walletconnect,
  address,
  session,
}: {
  walletconnect: Walletconnect;
  session: SessionTypes.Struct;
  chain: (typeof SUPPORTED_CHAINS)[number];
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  stagenet?: boolean;
  address: string;
}) {
  const from = address;

  switch (chain) {
    case Chain.Avalanche:
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error("Ethplorer API key not found");
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error("Covalent API key not found");

      const { getProvider, getToolboxByChain } = await import("@swapkit/toolbox-evm");
      const provider = getProvider(chain);
      const signer = await getEVMSigner({ walletconnect, chain, provider });
      const toolbox = getToolboxByChain(chain);

      return toolbox({
        provider,
        // @ts-expect-error TODO: fix this
        signer,
        ethplorerApiKey: ethplorerApiKey as string,
        covalentApiKey,
      });
    }

    case Chain.Binance: {
      const { sortObject, BinanceToolbox } = await import("@swapkit/toolbox-cosmos");
      const toolbox = BinanceToolbox();
      const transfer = async ({ recipient, assetValue, memo }: TransferParams) => {
        const account = await toolbox.getAccount(from);
        const { transaction, signMsg } = await toolbox.createTransactionAndSignMsg({
          recipient,
          from,
          assetValue,
          memo,
        });

        const signDoc = sortObject({
          account_number: account.account_number.toString(),
          chain_id: ChainId.Binance,
          data: null,
          memo,
          msgs: [signMsg],
          sequence: account.sequence.toString(),
          source: "0",
        });

        const response: Todo = await walletconnect?.client.request({
          chainId: BINANCE_MAINNET_ID,
          topic: session.topic,
          request: {
            method: DEFAULT_COSMOS_METHODS.COSMOS_SIGN_AMINO,
            params: { signerAddress: address, signDoc },
          },
        });

        const signature = Buffer.from(response.signature, "hex");
        const publicKey = toolbox.getPublicKey(response.publicKey);
        const signedTx = transaction.addSignature(publicKey, signature);

        const res = await toolbox.sendRawTransaction(signedTx.serialize(), true);

        return res?.result?.hash;
      };
      return { ...toolbox, transfer };
    }

    case Chain.THORChain: {
      const { SignMode } = await import("cosmjs-types/cosmos/tx/signing/v1beta1/signing.js");
      const { TxRaw } = await import("cosmjs-types/cosmos/tx/v1beta1/tx.js");
      const { encodePubkey, makeAuthInfoBytes } = await import("@cosmjs/proto-signing");
      const { makeSignDoc } = await import("@cosmjs/amino");
      const {
        ThorchainToolbox,
        buildAminoMsg,
        buildEncodedTxBody,
        createStargateClient,
        fromBase64,
        getDefaultChainFee,
        prepareMessageForBroadcast,
      } = await import("@swapkit/toolbox-cosmos");
      const toolbox = ThorchainToolbox({ stagenet: false });

      const fee = getDefaultChainFee(chain);

      const signRequest = (signDoc: StdSignDoc) =>
        walletconnect?.client.request({
          chainId: THORCHAIN_MAINNET_ID,
          topic: session.topic,
          request: {
            method: DEFAULT_COSMOS_METHODS.COSMOS_SIGN_AMINO,
            params: { signerAddress: address, signDoc },
          },
        });

      async function thorchainTransfer({
        assetValue,
        memo,
        ...rest
      }: TransferParams | DepositParam) {
        const account = await toolbox.getAccount(address);
        if (!account) throw new Error("Account not found");
        if (!account.pubkey) throw new Error("Account pubkey not found");
        const { accountNumber, sequence = 0 } = account;

        const msgs = [
          buildAminoMsg({ chain: Chain.THORChain, assetValue, memo, from: address, ...rest }),
        ];

        const signDoc = makeSignDoc(
          msgs,
          fee,
          ChainId.THORChain,
          memo,
          accountNumber?.toString(),
          sequence?.toString() || "0",
        );

        const signature: Todo = await signRequest(signDoc);

        const bodyBytes = await buildEncodedTxBody({
          chain: Chain.THORChain,
          msgs: msgs.map(prepareMessageForBroadcast),
          memo: memo || "",
        });
        const pubkey = encodePubkey(account.pubkey);
        const authInfoBytes = makeAuthInfoBytes(
          [{ pubkey, sequence }],
          fee.amount,
          Number.parseInt(fee.gas),
          undefined,
          undefined,
          SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        );

        const txRaw = TxRaw.fromPartial({
          bodyBytes,
          authInfoBytes,
          signatures: [
            fromBase64(
              typeof signature.signature === "string"
                ? signature.signature
                : signature.signature.signature,
            ),
          ],
        });
        const txBytes = TxRaw.encode(txRaw).finish();

        const broadcaster = await createStargateClient(RPCUrl.THORChain);
        const result = await broadcaster.broadcastTx(txBytes);
        return result.transactionHash;
      }

      return {
        ...toolbox,
        transfer: (params: TransferParams) => thorchainTransfer(params),
        deposit: (params: DepositParam) => thorchainTransfer(params),
      };
    }
    default:
      throw new Error("Chain is not supported");
  }
}

async function getWalletconnect(
  chains: Chain[],
  walletConnectProjectId?: string,
  walletconnectOptions?: SignClientTypes.Options,
) {
  let modal: WalletConnectModalSign | undefined;
  try {
    if (!walletConnectProjectId) {
      throw new Error("Error while setting up walletconnect connection: Project ID not specified");
    }
    const requiredNamespaces = getRequiredNamespaces(chains.map(chainToChainId));

    const { WalletConnectModalSign } = await import("@walletconnect/modal-sign-html");

    const client = new WalletConnectModalSign({
      logger: DEFAULT_LOGGER,
      relayUrl: DEFAULT_RELAY_URL,
      projectId: walletConnectProjectId,
      metadata: walletconnectOptions?.metadata || DEFAULT_APP_METADATA,
      ...walletconnectOptions?.core,
    });

    const oldSession = await client.getSession();

    // disconnect old Session cause we can't handle using it with current ui
    if (oldSession) {
      await client.disconnect({
        topic: oldSession.topic,
        reason: { code: 0, message: "Resetting session" },
      });
    }

    const session = await client.connect({ requiredNamespaces });

    const accounts = Object.values(session.namespaces).flatMap(
      (namespace: Todo) => namespace.accounts,
    );

    return { session, accounts, client };
  } catch (e) {
    console.error(e);
  } finally {
    if (modal) {
      // @ts-expect-error wrong typing
      modal.closeModal();
    }
  }
  return undefined;
}

export type Walletconnect = Awaited<ReturnType<typeof getWalletconnect>>;

function connectWalletconnect({
  addChain,
  config: {
    thorswapApiKey,
    ethplorerApiKey,
    walletConnectProjectId,
    covalentApiKey,
    stagenet = false,
  },
}: ConnectWalletParams) {
  return async function connectWallet(
    chains: (typeof WC_SUPPORTED_CHAINS)[number][],
    walletconnectOptions?: SignClientTypes.Options,
  ) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const chainsToConnect = chains.filter((chain) => WC_SUPPORTED_CHAINS.includes(chain));
    const walletconnect = await getWalletconnect(
      chainsToConnect,
      walletConnectProjectId,
      walletconnectOptions,
    );

    if (!walletconnect) throw new Error("Unable to establish connection through walletconnect");

    const { session, accounts } = walletconnect;

    const promises = chainsToConnect.map(async (chain) => {
      const address = getAddressByChain(chain, accounts);

      const toolbox = await getToolbox({
        session,
        address,
        chain,
        walletconnect,
        ethplorerApiKey,
        covalentApiKey,
        stagenet,
      });

      async function getAccount(accountAddress: string) {
        const account = await (toolbox as BaseCosmosToolboxType).getAccount(accountAddress);
        const [{ address, algo, pubkey }] = (await walletconnect?.client.request({
          chainId: THORCHAIN_MAINNET_ID,
          topic: session.topic,
          request: {
            method: DEFAULT_COSMOS_METHODS.COSMOS_GET_ACCOUNTS,
            params: {},
          },
        })) as [{ address: string; algo: string; pubkey: string }];

        return { ...account, address, pubkey: { type: algo, value: pubkey } };
      }

      addChain({
        ...toolbox,
        address,
        balance: [],
        chain,
        walletType: WalletOption.WALLETCONNECT,
        getAccount:
          chain === Chain.THORChain ? getAccount : (toolbox as BaseCosmosToolboxType).getAccount,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const walletconnectWallet = { connectWalletconnect } as const;

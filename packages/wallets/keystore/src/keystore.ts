import {
  type AssetValue,
  Chain,
  type ConnectWalletParams,
  DerivationPath,
  RPCUrl,
  type WalletChain,
  WalletOption,
  type WalletTxParams,
  type Witness,
  setRequestClientConfig,
} from "@swapkit/helpers";
import type { DepositParam, ThorchainToolboxType, TransferParams } from "@swapkit/toolbox-cosmos";
import type {
  Psbt,
  TransactionType,
  UTXOTransferParams,
  UTXOWalletTransferParams,
} from "@swapkit/toolbox-utxo";

type KeystoreOptions = {
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  covalentApiKey?: string;
  stagenet?: boolean;
};

type Params = KeystoreOptions & {
  api?: Todo;
  rpcUrl?: string;
  chain: Chain;
  phrase: string;
  index: number;
};

const getWalletMethodsForChain = async ({
  api,
  rpcUrl,
  chain,
  phrase,
  ethplorerApiKey,
  covalentApiKey,
  blockchairApiKey,
  index,
  stagenet,
}: Params) => {
  const derivationPath = `${DerivationPath[chain] as string}/${index}`;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey) {
        throw new Error("Ethplorer API key not found");
        // biome-ignore lint/style/noUselessElse: This is a valid use case
      } else if (!covalentApiKey) {
        throw new Error("Covalent API key not found");
      }

      const { HDNodeWallet, getProvider, getToolboxByChain } = await import("@swapkit/toolbox-evm");

      const provider = getProvider(chain, rpcUrl);
      const wallet = HDNodeWallet.fromPhrase(phrase).connect(provider);
      const params = { api, provider, signer: wallet };

      const toolbox = getToolboxByChain(chain)({
        ...params,
        covalentApiKey,
        ethplorerApiKey: ethplorerApiKey as string,
      });

      return { address: wallet.address, walletMethods: toolbox };
    }

    case Chain.BitcoinCash: {
      const { BCHToolbox } = await import("@swapkit/toolbox-utxo");
      const toolbox = BCHToolbox({
        rpcUrl,
        apiKey: blockchairApiKey,
        apiClient: api,
      });
      const keys = await toolbox.createKeysForPath({ phrase, derivationPath });
      const address = toolbox.getAddressFromKeys(keys);

      const walletMethods = {
        ...toolbox,
        transfer: (
          params: UTXOWalletTransferParams<
            Awaited<ReturnType<typeof toolbox.buildBCHTx>>,
            TransactionType
          >,
        ) =>
          toolbox.transfer({
            ...params,
            from: address,
            signTransaction: ({
              builder,
              utxos,
            }: Awaited<ReturnType<typeof toolbox.buildBCHTx>>) => {
              utxos.forEach((utxo, index) => {
                builder.sign(index, keys, undefined, 0x41, (utxo.witnessUtxo as Witness).value);
              });

              return builder.build();
            },
          }),
      };

      return { address, walletMethods };
    }

    case Chain.Bitcoin:
    case Chain.Dash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-utxo");

      const toolbox = getToolboxByChain(chain)({
        rpcUrl,
        apiKey: blockchairApiKey,
        apiClient: api,
      });

      const keys = toolbox.createKeysForPath({ phrase, derivationPath });
      const address = toolbox.getAddressFromKeys(keys);

      return {
        address,
        walletMethods: {
          ...toolbox,
          transfer: (params: UTXOTransferParams) =>
            toolbox.transfer({
              ...params,
              from: address,
              signTransaction: (psbt: Psbt) => {
                psbt.signAllInputs(keys);
                return psbt;
              },
            }),
        },
      };
    }

    case Chain.Cosmos:
    case Chain.Kujira:
    case Chain.Maya:
    case Chain.THORChain: {
      const { getToolboxByChain } = await import("@swapkit/toolbox-cosmos");

      const toolbox = getToolboxByChain(chain)({ server: api, stagenet });
      const signer = await toolbox.getSigner(phrase);
      const address = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = async ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from: address,
          recipient,
          assetValue,
          memo,
          signer,
        });

      const deposit =
        "deposit" in toolbox
          ? ({ assetValue, memo }: DepositParam) => {
              return (toolbox as ThorchainToolboxType).deposit({
                assetValue,
                memo,
                from: address,
                signer,
              });
            }
          : undefined;

      const signMessage = async (message: string) => {
        const privateKey = await toolbox.createPrivateKeyFromPhrase(phrase);
        return (toolbox as ThorchainToolboxType).signMessage(privateKey, message);
      };

      const walletMethods = {
        ...toolbox,
        deposit,
        transfer,
        signMessage,
      };

      return { address, walletMethods };
    }

    case Chain.Polkadot:
    case Chain.Chainflip: {
      const { Network, getToolboxByChain, createKeyring } = await import(
        "@swapkit/toolbox-substrate"
      );

      const signer = await createKeyring(phrase, Network[chain].prefix);
      const toolbox = await getToolboxByChain(chain, { signer });

      return { address: signer.address, walletMethods: toolbox };
    }

    case Chain.Radix: {
      const { getRadixCoreApiClient, RadixToolbox, createPrivateKey, RadixMainnet } = await import(
        "@swapkit/toolbox-radix"
      );

      const api = await getRadixCoreApiClient(RPCUrl.Radix, RadixMainnet);
      const signer = await createPrivateKey(phrase);
      const toolbox = await RadixToolbox({ api, signer });

      return { address: await toolbox.getAddress(), walletMethods: toolbox };
    }

    case Chain.Solana: {
      const { SOLToolbox } = await import("@swapkit/toolbox-solana");
      const toolbox = SOLToolbox({ rpcUrl });
      const keypair = toolbox.createKeysForPath({ phrase, derivationPath });

      return {
        address: toolbox.getAddressFromKeys(keypair),
        walletMethods: {
          ...toolbox,
          transfer: (params: WalletTxParams & { assetValue: AssetValue }) =>
            toolbox.transfer({ ...params, fromKeypair: keypair }),
        },
      };
    }

    default:
      throw new Error(`Unsupported chain ${chain}`);
  }
};

function connectKeystore({
  addChain,
  apis,
  rpcUrls,
  config: { thorswapApiKey, covalentApiKey, ethplorerApiKey, blockchairApiKey, stagenet },
}: ConnectWalletParams) {
  return async function connectKeystore(chains: WalletChain[], phrase: string, index = 0) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const promises = chains.map(async (chain) => {
      const { address, walletMethods } = await getWalletMethodsForChain({
        index,
        chain,
        api: apis[chain as Chain.Avalanche],
        rpcUrl: rpcUrls[chain],
        covalentApiKey,
        ethplorerApiKey,
        phrase,
        blockchairApiKey,
        stagenet,
      });

      addChain({
        chain,
        address,
        balance: [],
        walletType: WalletOption.KEYSTORE,
        ...walletMethods,
      });
    });

    await Promise.all(promises);

    return true;
  };
}

export const keystoreWallet = { connectKeystore } as const;

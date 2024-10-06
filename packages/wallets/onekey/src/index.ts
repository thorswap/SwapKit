import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  type AssetValue,
  Chain,
  ChainToHexChainId,
  type ConnectWalletParams,
  SwapKitError,
  WalletOption,
  type WalletTxParams,
  addEVMWalletNetwork,
  ensureEVMApiKeys,
  prepareNetworkSwitch,
  setRequestClientConfig,
} from "@swapkit/helpers";
import {
  type AVAXToolbox,
  BrowserProvider,
  getProvider,
  getToolboxByChain,
} from "@swapkit/toolbox-evm";
import { createSolanaTokenTransaction } from "@swapkit/toolbox-solana";
import { BTCToolbox, Psbt, type UTXOTransferParams } from "@swapkit/toolbox-utxo";
import {
  AddressPurpose,
  BitcoinNetworkType,
  type BitcoinProvider,
  type GetAddressOptions,
  type GetAddressResponse,
  type SignTransactionOptions,
  getAddress,
  signTransaction as satsSignTransaction,
} from "sats-connect";

declare global {
  interface Window {
    $onekey: any;
  }
}

export const ONEKEY_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.Base,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  //   Chain.BitcoinCash,
  //   Chain.Cosmos,
  //   Chain.Dash,
  //   Chain.Dogecoin,
  Chain.Ethereum,
  //   Chain.Litecoin,
  Chain.Optimism,
  //   Chain.Polkadot,
  Chain.Polygon,
  Chain.Solana,
] as const;

type OnekeyOptions = {
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  covalentApiKey?: string;
  trezorManifest?: { appUrl: string; email: string };
};

type Params = OnekeyOptions & {
  // TODO improve api typing
  api?: any;
  chain: Chain;
  //   derivationPath: DerivationPathArray;
  rpcUrl?: string;
};

// async function getToolbox({
//   api,
//   rpcUrl,
//   chain,
//   derivationPath,
//   blockchairApiKey,
//   ethplorerApiKey,
//   covalentApiKey,
// }: Params) {
//   switch (chain) {
//     case Chain.BinanceSmartChain:
//     case Chain.Avalanche:
//     case Chain.Arbitrum:
//     case Chain.Optimism:
//     case Chain.Polygon:
//     case Chain.Ethereum: {
//       const { getProvider, getToolboxByChain } = await import("@swapkit/toolbox-evm");
//       const { getEVMSigner } = await import("./evmSigner");

//       const keys = ensureEVMApiKeys({ chain, ethplorerApiKey, covalentApiKey });
//       const provider = getProvider(chain, rpcUrl);
//       const toolbox = getToolboxByChain(chain);

//       const signer = await getEVMSigner({ chain, derivationPath, provider });
//       const address = await signer.getAddress();

//       return { address, walletMethods: toolbox({ ...keys, api, provider, signer }) };
//     }

//     case Chain.Bitcoin:
//     case Chain.BitcoinCash:
//     case Chain.Dash:
//     case Chain.Dogecoin:
//     case Chain.Litecoin: {
//       const { toCashAddress, getToolboxByChain, BCHToolbox } = await import(
//         "@swapkit/toolbox-utxo"
//       );

//       if (!(blockchairApiKey || api)) {
//         throw new SwapKitError({
//           errorKey: "wallet_missing_api_key",
//           info: { missingKey: "blockchairApiKey" },
//         });
//       }

//       const scriptType = getScriptType(derivationPath);

//       if (!scriptType) {
//         throw new SwapKitError({
//           errorKey: "wallet_trezor_derivation_path_not_supported",
//           info: { derivationPath },
//         });
//       }

//       const coin = chain.toLowerCase();
//       const params = { apiClient: api, apiKey: blockchairApiKey, rpcUrl };
//       const toolbox = getToolboxByChain(chain)(params);

//       const getAddress = async (path: DerivationPathArray = derivationPath) => {
//         const { default: TrezorConnect } = await import("@trezor/connect-web");
//         const { success, payload } = await TrezorConnect.getAddress({
//           path: derivationPathToString(path),
//           coin,
//         });

//         if (!success) {
//           throw new SwapKitError({
//             errorKey: "wallet_trezor_failed_to_get_address",
//             info: {
//               chain,
//               error: (payload as { error: string; code?: string }).error || "Unknown error",
//             },
//           });
//         }

//         return chain === Chain.BitcoinCash
//           ? (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(payload.address)
//           : payload.address;
//       };

//       const address = await getAddress();

//       const signTransaction = async (psbt: Psbt, inputs: UTXOType[], memo = "") => {
//         const { default: TrezorConnect } = await import("@trezor/connect-web");
//         const address_n = derivationPath.map((pathElement, index) =>
//           index < 3 ? ((pathElement as number) | 0x80000000) >>> 0 : (pathElement as number),
//         );

//         const result = await TrezorConnect.signTransaction({
//           coin,
//           inputs: inputs.map((input) => ({
//             // Hardens the first 3 elements of the derivation path - required by trezor
//             address_n,
//             prev_hash: input.hash,
//             prev_index: input.index,
//             // object needs amount but does not use it for signing
//             amount: input.value,
//             script_type: scriptType.input,
//           })),

//           // Lint is not happy with the type of txOutputs
//           // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO: refactor
//           outputs: psbt.txOutputs.map((output: any) => {
//             const outputAddress =
//               chain === Chain.BitcoinCash && output.address
//                 ? toCashAddress(output.address)
//                 : output.address;

//             // Strip prefix from BCH address to compare with stripped address from Trezor
//             const isChangeAddress =
//               chain === Chain.BitcoinCash && outputAddress
//                 ? (toolbox as ReturnType<typeof BCHToolbox>).stripPrefix(outputAddress) === address
//                 : outputAddress === address;

//             // OP_RETURN
//             if (!output.address) {
//               return {
//                 amount: "0",
//                 op_return_data: Buffer.from(memo).toString("hex"),
//                 script_type: "PAYTOOPRETURN",
//               };
//             }

//             // Change Address
//             if (isChangeAddress) {
//               return { address_n, amount: output.value, script_type: scriptType.output };
//             }

//             // Outgoing UTXO
//             return { address: outputAddress, amount: output.value, script_type: "PAYTOADDRESS" };
//           }),
//         });

//         if (result.success) {
//           return result.payload.serializedTx;
//         }

//         throw new SwapKitError({
//           errorKey: "wallet_trezor_failed_to_sign_transaction",
//           info: {
//             chain,
//             error: (result.payload as { error: string; code?: string }).error,
//           },
//         });
//       };

//       const transfer = async ({
//         from,
//         recipient,
//         feeOptionKey,
//         feeRate,
//         memo,
//         ...rest
//       }: UTXOTransferParams) => {
//         if (!from)
//           throw new SwapKitError({
//             errorKey: "wallet_missing_params",
//             info: { wallet: WalletOption.TREZOR, memo, from },
//           });
//         if (!recipient)
//           throw new SwapKitError({
//             errorKey: "wallet_missing_params",
//             info: { wallet: WalletOption.TREZOR, memo, recipient },
//           });

//         const { psbt, inputs } = await toolbox.buildTx({
//           ...rest,
//           memo,
//           recipient,
//           feeRate: feeRate || (await toolbox.getFeeRates())[feeOptionKey || FeeOption.Fast],
//           sender: from,
//           fetchTxHex: chain === Chain.Dogecoin,
//         });

//         const txHex = await signTransaction(psbt, inputs, memo);
//         return toolbox.broadcastTx(txHex);
//       };

//       return {
//         address,
//         walletMethods: {
//           ...toolbox,
//           transfer,
//           signTransaction,
//         },
//       };
//     }
//     default:
//       throw new SwapKitError({
//         errorKey: "wallet_chain_not_supported",
//         info: { chain, wallet: WalletOption.TREZOR },
//       });
//   }
// }

// function subscribeToEvents(sdk: typeof onekeySdk.HardwareWebSdk) {
//   sdk.on(UI_EVENT, (message: CoreMessage) => {
//     // Handle the PIN code input event
//     if (message.type === UI_REQUEST.REQUEST_PIN) {
//       // Demo1 Enter the PIN code on the device
//       sdk.uiResponse({
//         type: UI_RESPONSE.RECEIVE_PIN,
//         payload: "@@ONEKEY_INPUT_PIN_IN_DEVICE",
//       });

//       // Demo2 Software processing Pin code
//       // Pseudocode
//       //   showUIprompts(confirm: (pin)=>{
//       //   // Tell the hardware ui request processing result
//       //   sdk.uiResponse({
//       //     type: UI_RESPONSE.RECEIVE_PIN,
//       //     payload: pin,
//       //   });
//       // })
//     }

//     // Handle the passphrase event
//     if (message.type === UI_REQUEST.REQUEST_PASSPHRASE) {
//       // Demo1 Enter the passphrase on the device
//       sdk.uiResponse({
//         type: UI_RESPONSE.RECEIVE_PASSPHRASE,
//         payload: {
//           value: "",
//           passphraseOnDevice: true,
//         },
//       });

//       // Demo2 Software processing passphrase
//       // Pseudocode
//       //   showUIprompts(confirm: (passphrase)=>{
//       //   // Tell the hardware ui request processing result
//       //   sdk.uiResponse({
//       //     type: UI_RESPONSE.RECEIVE_PASSPHRASE,
//       //     payload: {
//       //       value: passphrase,
//       //     },
//       //   });
//       // })
//     }

//     if (message.type === UI_REQUEST.REQUEST_BUTTON) {
//       // Confirmation is required on the device, a UI prompt can be displayed
//     }
//     if (message.type === UI_REQUEST.CLOSE_UI_WINDOW) {
//       // The method invocation is completed. You may close all UI prompts.
//     }
//   });
// }

// function connectOnekeyHW({
//   apis,
//   rpcUrls,
//   addChain,
//   config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, thorswapApiKey },
// }: ConnectWalletParams) {
//   return async function connectOnekeyHW(chains: (typeof ONEKEY_SUPPORTED_CHAINS)[number][]) {
//     const chain = chains[0];
//     if (!chain) return false;

//     setRequestClientConfig({ apiKey: thorswapApiKey });

//     await onekeySdk.HardwareWebSdk.init({
//       debug: true,
//       fetchConfig: true,
//       connectSrc: "https://jssdk.onekey.so/0.3.38/",
//       env: "web",
//     });

//     const connectedDevices = await onekeySdk.HardwareWebSdk.searchDevices();

//     console.log(connectedDevices, connectedDevices.success, connectedDevices.payload.length);

//     if (
//       !connectedDevices.success ||
//       (connectedDevices.success && !connectedDevices.payload.length)
//     ) {
//       throw new SwapKitError("wallet_onekey_no_device_found");
//     }

//     subscribeToEvents(onekeySdk.HardwareWebSdk);

//     // const { address, walletMethods } = await getToolbox({
//     //   api: apis[chain],
//     //   rpcUrl: rpcUrls[chain],
//     //   chain,
//     //   covalentApiKey,
//     //   ethplorerApiKey,
//     //   blockchairApiKey,
//     //   derivationPath,
//     // });

//     // addChain({
//     //   chain,
//     //   ...walletMethods,
//     //   address,
//     //   balance: [],
//     //   walletType: WalletOption.TREZOR,
//     // });

//     return true;
//   };
// }

// export const onekeyHWWallet = { connectOnekeyHW } as const;

async function getWalletMethodsForExtension({
  api,
  rpcUrl,
  chain,
  covalentApiKey,
  ethplorerApiKey,
  blockchairApiKey,
}: Params) {
  switch (chain) {
    case Chain.Bitcoin: {
      const toolbox = BTCToolbox({ rpcUrl, apiKey: blockchairApiKey, apiClient: api });

      let address = "";

      const getProvider: () => Promise<BitcoinProvider | undefined> = () =>
        new Promise((res) => res(window.$onekey.btc as BitcoinProvider));

      const getAddressOptions: GetAddressOptions = {
        getProvider,
        payload: {
          purposes: [AddressPurpose.Payment],
          message: "Address for receiving and sending payments",
          network: { type: BitcoinNetworkType.Mainnet },
        },
        onFinish: (response: GetAddressResponse) => {
          if (!response.addresses[0]) throw Error("No address found");
          address = response.addresses[0].address;
        },
        onCancel: () => {
          throw Error("Request canceled");
        },
      };

      await getAddress(getAddressOptions);

      async function signTransaction(psbt: Psbt) {
        let signedPsbt: Psbt | undefined;
        const signPsbtOptions: SignTransactionOptions = {
          getProvider,
          payload: {
            message: "Sign transaction",
            network: {
              type: BitcoinNetworkType.Mainnet,
            },
            psbtBase64: psbt.toBase64(),
            broadcast: false,
            inputsToSign: [
              {
                address: address,
                signingIndexes: psbt.txInputs.map((_, index) => index),
              },
            ],
          },
          onFinish: (response) => {
            signedPsbt = Psbt.fromBase64(response.psbtBase64);
          },
          onCancel: () => {
            throw Error("Signature canceled");
          },
        };

        await satsSignTransaction(signPsbtOptions);
        return signedPsbt;
      }

      const transfer = (transferParams: UTXOTransferParams) => {
        return toolbox.transfer({
          ...transferParams,
          signTransaction,
        });
      };

      return { ...toolbox, transfer, address };
    }
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Ethereum: {
      const keys = ensureEVMApiKeys({ chain, covalentApiKey, ethplorerApiKey });
      const provider = getProvider(chain);
      const browserProvider = new BrowserProvider(window.$onekey.ethereum, "any");
      await browserProvider.send("eth_requestAccounts", []);

      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      const toolbox = getToolboxByChain(chain)({ ...keys, provider, signer });

      try {
        chain !== Chain.Ethereum &&
          (await addEVMWalletNetwork(
            browserProvider,
            (toolbox as ReturnType<typeof AVAXToolbox>).getNetworkParams(),
          ));
      } catch (_error) {
        throw new Error(`Failed to add/switch ${chain} network: ${chain}`);
      }

      return {
        address,
        ...prepareNetworkSwitch<typeof toolbox>({
          toolbox,
          chainId: ChainToHexChainId[chain],
          provider: browserProvider,
        }),
      };
    }
    case Chain.Solana: {
      const { SOLToolbox } = await import("@swapkit/toolbox-solana");
      const provider = window.$onekey.solana;
      if (!provider?.isPhantom) {
        throw new SwapKitError("wallet_phantom_not_found");
      }

      const providerConnection = await provider.connect();
      const address: string = providerConnection.publicKey.toString();

      const toolbox = SOLToolbox({ rpcUrl });

      const transfer = async ({
        recipient,
        assetValue,
        isPDA,
      }: WalletTxParams & {
        assetValue: AssetValue;
        isPDA?: boolean;
      }) => {
        if (!(isPDA || toolbox.validateAddress(recipient))) {
          throw new SwapKitError("core_transaction_invalid_recipient_address");
        }

        const fromPubkey = new PublicKey(address);

        const transaction = assetValue.isGasAsset
          ? new Transaction().add(
              SystemProgram.transfer({
                fromPubkey,
                lamports: assetValue.getBaseValue("number"),
                toPubkey: new PublicKey(recipient),
              }),
            )
          : assetValue.address
            ? await createSolanaTokenTransaction({
                amount: assetValue.getBaseValue("number"),
                connection: toolbox.connection,
                decimals: assetValue.decimal as number,
                from: fromPubkey,
                recipient,
                tokenAddress: assetValue.address,
              })
            : undefined;

        if (!transaction) {
          throw new SwapKitError("core_transaction_invalid_sender_address");
        }

        const blockHash = await toolbox.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockHash.blockhash;
        transaction.feePayer = fromPubkey;

        const signedTransaction = await provider.signTransaction(transaction);

        const txid = await toolbox.connection.sendRawTransaction(signedTransaction.serialize());

        return txid;
      };

      return { ...toolbox, transfer, address };
    }
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

function connectOnekey({
  apis,
  rpcUrls,
  addChain,
  config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, thorswapApiKey },
}: ConnectWalletParams) {
  return async function connectOnekey(chains: (typeof ONEKEY_SUPPORTED_CHAINS)[number][]) {
    if (!chains.length) return false;

    setRequestClientConfig({ apiKey: thorswapApiKey });

    async function connectChain(chain: (typeof ONEKEY_SUPPORTED_CHAINS)[number]) {
      const { address, ...methods } = await getWalletMethodsForExtension({
        api: apis[chain],
        rpcUrl: rpcUrls[chain],
        chain,
        covalentApiKey,
        ethplorerApiKey,
        blockchairApiKey,
      });

      addChain({
        ...methods,
        chain,
        address,
        walletType: WalletOption.ONEKEY,
        balance: [],
      });
    }

    try {
      for (const chain of chains) {
        await connectChain(chain);
      }

      return true;
    } catch (error) {
      if (error instanceof SwapKitError) throw error;

      throw new SwapKitError("wallet_connection_rejected_by_user");
    }
  };
}

export const onekeyExtensionWallet = { connectOnekey } as const;

export const isOnkeyExtensionDetected = typeof window !== "undefined" && window.$onekey.ethereum;

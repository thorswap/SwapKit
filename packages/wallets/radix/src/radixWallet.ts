import { DataRequestBuilder, RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import {
  AssetValue,
  Chain,
  type ConnectWalletParams,
  SwapKitError,
  SwapKitNumber,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import { RadixMainnet, type RadixNetwork, type RadixSigner } from "@swapkit/toolbox-radix";

type RadixDappConfig = {
  dAppDefinitionAddress: string;
  network: RadixNetwork;
  applicationName: string;
  applicationVersion: string;
};

// TODO figure out way to make wallet work nicely with toolbox without reimplementing all the methods
const RadixSignerInstance = (
  rdt: RadixDappToolkit,
): RadixSigner & { getAddress: () => Promise<string> } => {
  return {
    getAddress: async () => {
      return new Promise((resolve) => {
        const existingWalletData = rdt.walletApi.getWalletData();
        const account = existingWalletData?.accounts?.[0];

        if (account) resolve(account.address);

        rdt.walletApi.setRequestData(DataRequestBuilder.accounts().exactly(1));
        rdt.walletApi.sendRequest();

        rdt.walletApi.walletData$.subscribe((state) => {
          if (state.accounts[0]) {
            resolve(state.accounts[0].address);
          }
        });
      });
    },
    publicKey: () => {
      throw new Error("Not implemented");
    },
    publicKeyBytes: () => {
      throw new Error("Not implemented");
    },
    publicKeyHex: () => {
      throw new Error("Not implemented");
    },
    sign: (_messageHash: Uint8Array) => {
      throw new Error("Not implemented");
    },
    signToSignature: (_messageHash: Uint8Array) => {
      throw new Error("Not implemented");
    },
    signToSignatureWithPublicKey: (_messageHash: Uint8Array) => {
      throw new Error("Not implemented");
    },
  };
};

const getWalletMethods = async (dappConfig: RadixDappConfig) => {
  const { RadixToolbox } = await import("@swapkit/toolbox-radix");

  const rdt = RadixDappToolkit({ ...dappConfig, networkId: dappConfig.network.networkId });

  const signer = await RadixSignerInstance(rdt);
  const toolbox = await RadixToolbox({ network: dappConfig.network, dappConfig, signer });

  const address = await signer.getAddress();

  return {
    address,
    walletMethods: {
      ...toolbox,
      getBalance: () => toolbox.getBalance(address),
      transfer: async (params: { assetValue: AssetValue; recipient: string; from: string }) => {
        const assetValue =
          params.assetValue.toString() === "XRD.XRD"
            ? AssetValue.from({
                asset:
                  "XRD.XRD-resource_rdx1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxradxrd",
                value: params.assetValue.getValue("string"),
              })
            : params.assetValue;

        if (!assetValue.address)
          throw new SwapKitError("wallet_missing_params", "AssetValue address missing");

        const manifest = toolbox.simpleTransferManifest({
          assetValue: params.assetValue,
          fees: new SwapKitNumber(5),
          from: params.from,
          recipient: params.from,
        });

        const manifestString = await toolbox.convertInstructionsToManifest(manifest.instructions);

        const txResult = (
          await rdt.walletApi.sendTransaction({
            transactionManifest: manifestString.value as string,
            message: `Transfer to ${params.recipient}`,
          })
        ).unwrapOr(null)?.transactionIntentHash;

        if (!txResult) {
          throw new SwapKitError("wallet_radix_transaction_failed");
        }

        return txResult;
      },
      signAndBroadcast: async ({ manifest, message }: { manifest: string; message: string }) => {
        const txResult = (
          await rdt.walletApi.sendTransaction({
            transactionManifest: manifest,
            message,
          })
        ).unwrapOr(null)?.transactionIntentHash;

        if (!txResult) {
          throw new SwapKitError("wallet_radix_transaction_failed");
        }

        return txResult;
      },
      getAddress: signer.getAddress,
    },
  };
};

function connectRadixWallet({
  addChain,
  config: { thorswapApiKey },
  radixDappConfig = {
    network: RadixMainnet,
    dAppDefinitionAddress: "account_rdx128r289p58222hcvev7frs6kue76pl7pdcnw8725aw658v0zggkh9ws",
    applicationName: "Swapkit Playground",
    applicationVersion: "0.0.1",
  },
}: ConnectWalletParams & {
  radixDappConfig?: RadixDappConfig;
}) {
  return async function connectRadixWallet(_chains: Chain.Radix[]) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const { address, walletMethods } = await getWalletMethods(radixDappConfig);

    addChain({
      chain: Chain.Radix,
      address,
      balance: [],
      walletType: WalletOption.RADIX_WALLET,
      ...walletMethods,
    });

    return true;
  };
}

export const radixWallet = { connectRadixWallet } as const;

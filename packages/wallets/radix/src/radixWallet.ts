import { DataRequestBuilder, RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";
import {
  Chain,
  type ConnectWalletParams,
  RPCUrl,
  WalletOption,
  setRequestClientConfig,
} from "@swapkit/helpers";
import { RadixMainnet, type RadixSigner } from "@swapkit/toolbox-radix";

// TODO figure out way to make wallet work nicely with toolbox without reimplementing all the methods
const RadixSignerInstance = (): RadixSigner & { getAddress: () => Promise<string> } => {
  const rdt = RadixDappToolkit({
    dAppDefinitionAddress: "account_rdx128r289p58222hcvev7frs6kue76pl7pdcnw8725aw658v0zggkh9ws",
    networkId: RadixMainnet.networkId,
    applicationName: "Swapkit Playground",
    applicationVersion: "1.0.0",
  });

  return {
    getAddress: () => {
      return new Promise((resolve) => {
        const existingWalletData = rdt.walletApi.getWalletData();
        if (existingWalletData.accounts[0]) resolve(existingWalletData.accounts[0].address);

        rdt.walletApi.setRequestData(DataRequestBuilder.accounts().atLeast(1));

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

const getWalletMethods = async () => {
  const { getRadixCoreApiClient, RadixToolbox, RadixMainnet } = await import(
    "@swapkit/toolbox-radix"
  );

  const api = await getRadixCoreApiClient(RPCUrl.Radix, RadixMainnet);

  const signer = await RadixSignerInstance();
  const toolbox = await RadixToolbox({ api, signer });

  const address = await signer.getAddress();

  return {
    address,
    walletMethods: {
      ...toolbox,
      getAddress: signer.getAddress,
      getBalance: () => toolbox.getBalance(address),
    },
  };
};

function connectRadixWallet({ addChain, config: { thorswapApiKey } }: ConnectWalletParams) {
  return async function connectRadixWallet(_chains: Chain.Radix[]) {
    setRequestClientConfig({ apiKey: thorswapApiKey });

    const { address, walletMethods } = await getWalletMethods();

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

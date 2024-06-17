import { CoreApiClient } from "@radixdlt/babylon-core-api-sdk";

import {
  LTSRadixEngineToolkit,
  NetworkId,
  PrivateKey,
  type PublicKey,
  type Signature,
  type SignatureWithPublicKey,
  SimpleTransactionBuilder,
} from "@radixdlt/radix-engine-toolkit";
import { mnemonicToSeed } from "@scure/bip39";
import { AssetValue, Chain, RPCUrl } from "@swapkit/helpers";
import type { RadixNetwork } from "./types";

// TODO combine this type with the more general SK type
type SubstrateTransferParams = {
  recipient: string;
  assetValue: AssetValue;
  from: string;
};

export type RadixSigner = {
  publicKey(): PublicKey;
  publicKeyBytes(): Uint8Array;
  publicKeyHex(): string;
  sign(messageHash: Uint8Array): Uint8Array;
  signToSignature(messageHash: Uint8Array): Signature;
  signToSignatureWithPublicKey(messageHash: Uint8Array): SignatureWithPublicKey;
};

export async function createPrivateKey(phrase: string) {
  const seed = await mnemonicToSeed(phrase);

  return new PrivateKey.Ed25519(seed.slice(0, 32));
}

function getAddress(signer: RadixSigner, network: RadixNetwork) {
  return LTSRadixEngineToolkit.Derive.virtualAccountAddress(signer.publicKey(), network.networkId);
}

// Could not find anything sync in SDK, ask Radix team
function validateAddress(address: string) {
  return address.startsWith("account_rdx1") && address.length === 66;
}

async function transfer(
  api: CoreApiClient,
  signer: RadixSigner,
  network: RadixNetwork,
  { recipient, assetValue, from }: SubstrateTransferParams,
) {
  if (!assetValue.address) throw new Error("Asset value must have an address");

  const constructionMetadata = await api.LTS.getConstructionMetadata();
  const builder = await SimpleTransactionBuilder.new({
    networkId: network.networkId,
    validFromEpoch: constructionMetadata.current_epoch,
    fromAccount: from,
    signerPublicKey: signer.publicKey(),
  });

  const unsignedTransaction = builder
    .transferFungible({
      toAccount: recipient,
      resourceAddress: assetValue.address,
      amount: assetValue.getBaseValue("number"),
    })
    .compileIntent();

  const notarySignature = signer.signToSignature(unsignedTransaction.hashToNotarize);

  const notarizedTransaction = unsignedTransaction.compileNotarized(notarySignature);

  const intentHashTransactionId = notarizedTransaction.transactionId.id;

  try {
    await api.LTS.submitTransaction({
      notarized_transaction_hex: notarizedTransaction.toHex(),
    });
  } catch (error) {
    throw new Error(`Failed to submit transaction: ${error}`);
  }

  return intentHashTransactionId;
}

async function getBalance(api: CoreApiClient, address: string) {
  const balancesRaw = await api.LTS.getAccountAllFungibleResourceBalances({
    account_address: address,
  });

  const balances = balancesRaw.fungible_resource_balances.map((balance) => {
    const assetWithoutAddress = new AssetValue({
      value: balance.amount,
      chain: Chain.Radix,
      decimal: 8,
      symbol: balance.fungible_resource_address,
    });

    assetWithoutAddress.address = balance.fungible_resource_address;

    return assetWithoutAddress;
  });

  return balances;
}

export async function getRadixCoreApiClient(
  coreApiBase: string = RPCUrl.Radix,
  network: RadixNetwork = {
    networkId: NetworkId.Mainnet,
    networkName: "mainnet",
    dashboardBase: "https://dashboard.radixdlt.com",
  },
) {
  return await CoreApiClient.initialize({
    basePath: coreApiBase,
    logicalNetworkName: network.networkName,
    fetch,
  });
}

export const RadixToolbox = async ({
  api,
  network = {
    networkId: NetworkId.Mainnet,
    networkName: "mainnet",
    dashboardBase: "https://dashboard.radixdlt.com",
  },
  signer,
}: {
  api: CoreApiClient;
  network?: RadixNetwork;
  signer: RadixSigner;
}) => ({
  api,
  createPrivateKey,
  getAddress: () => getAddress(signer, network),
  validateAddress: (address: string) => validateAddress(address),
  transfer: (params: SubstrateTransferParams) => transfer(api, signer, network, params),
  getBalance: async (address?: string) =>
    getBalance(api, address || (await getAddress(signer, network))),
});

export const RadixMainnet = {
  networkId: NetworkId.Mainnet,
  networkName: "mainnet",
  dashboardBase: "https://dashboard.radixdlt.com",
};

export type RadixWallet = ReturnType<typeof RadixToolbox>;

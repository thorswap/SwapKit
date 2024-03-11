import type { Pubkey, Secp256k1HdWallet } from "@cosmjs/amino";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { Account } from "@cosmjs/stargate";
import { base64 } from "@scure/base";
import type { AssetValue } from "@swapkit/helpers";
import { RequestClient, SwapKitNumber } from "@swapkit/helpers";
import { ApiUrl, BaseDecimal, Chain, ChainId, DerivationPath, FeeOption } from "@swapkit/types";

import { CosmosClient } from "../cosmosClient.ts";
import {
  buildAminoMsg,
  buildEncodedTxBody,
  buildTransaction,
  convertToSignable,
  createDefaultAminoTypes,
  createDefaultRegistry,
  getDefaultChainFee,
  prepareMessageForBroadcast,
} from "../thorchainUtils/index.ts";
import type {
  DepositParam,
  MayaToolboxType,
  ThorchainConstantsResponse,
  ThorchainToolboxType,
} from "../thorchainUtils/types/client-types.ts";
import type { Signer, ToolboxParams, TransferParams } from "../types.ts";
import {
  createOfflineStargateClient,
  createSigningStargateClient,
  createStargateClient,
  getRPC,
} from "../util.ts";

import { BaseCosmosToolbox } from "./BaseCosmosToolbox.ts";

const secp256k1HdWalletFromMnemonic =
  ({ prefix, derivationPath }: { prefix: string; derivationPath: string }) =>
  async (mnemonic: string, index = 0) => {
    const { Secp256k1HdWallet } = await import("@cosmjs/amino");
    const { stringToPath } = await import("@cosmjs/crypto");

    return Secp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [stringToPath(`${derivationPath}/${index}`)],
      prefix,
    });
  };

const exportSignature = (signature: Uint8Array) => base64.encode(signature);

const signMultisigTx = async (wallet: Secp256k1HdWallet, tx: string) => {
  const { msgs, accountNumber, sequence, chainId, fee, memo } = JSON.parse(tx);

  const address = (await wallet.getAccounts())[0].address;
  const aminoTypes = await createDefaultAminoTypes();
  const registry = await createDefaultRegistry();
  const signingClient = await createOfflineStargateClient(wallet, {
    registry,
    aminoTypes,
  });

  const msgForSigning = [];

  for (const msg of msgs) {
    const signMsg = await convertToSignable(msg);
    msgForSigning.push(signMsg);
  }

  const {
    signatures: [signature],
  } = await signingClient.sign(address, msgForSigning, fee, memo, {
    accountNumber,
    sequence,
    chainId,
  });

  const bodyBytes = await buildEncodedTxBody({
    msgs: msgs.map((msg: any) => prepareMessageForBroadcast(msg)),
    memo,
  });

  return { signature: exportSignature(signature), bodyBytes };
};

const broadcastMultisigTx =
  ({ prefix, rpcUrl }: { prefix: string; rpcUrl: string }) =>
  async (
    tx: string,
    signers: Signer[],
    membersPubKeys: string[],
    threshold: number,
    bodyBytes: Uint8Array,
  ) => {
    const { sequence, fee } = JSON.parse(tx);
    const multisigPubkey = await createMultisig(membersPubKeys, threshold);

    const { pubkeyToAddress, encodeSecp256k1Pubkey } = await import("@cosmjs/amino");
    const { makeMultisignedTxBytes } = await import("@cosmjs/stargate");

    const addressesAndSignatures: [string, Uint8Array][] = signers.map((signer) => [
      pubkeyToAddress(encodeSecp256k1Pubkey(base64.decode(signer.pubKey)), prefix),
      base64.decode(signer.signature),
    ]);

    const broadcaster = await createStargateClient(rpcUrl);

    const { transactionHash } = await broadcaster.broadcastTx(
      makeMultisignedTxBytes(
        multisigPubkey,
        sequence,
        fee,
        bodyBytes,
        new Map<string, Uint8Array>(addressesAndSignatures),
      ),
    );

    return transactionHash;
  };

const createMultisig = async (pubKeys: string[], threshold: number, noSortPubKeys = true) => {
  const { encodeSecp256k1Pubkey, createMultisigThresholdPubkey } = await import("@cosmjs/amino");
  return createMultisigThresholdPubkey(
    pubKeys.map((pubKey) => encodeSecp256k1Pubkey(base64.decode(pubKey))),
    threshold,
    noSortPubKeys,
  );
};

const importSignature = (signature: string) => base64.decode(signature);

const __REEXPORT__pubkeyToAddress = (prefix: string) => async (pubkey: Pubkey) => {
  const { pubkeyToAddress } = await import("@cosmjs/amino");

  return pubkeyToAddress(pubkey, prefix);
};

const signMessage = async (privateKey: Uint8Array, message: string) => {
  const { Secp256k1 } = await import("@cosmjs/crypto");

  const signature = await Secp256k1.createSignature(base64.decode(message), privateKey);
  return base64.encode(Buffer.concat([signature.r(32), signature.s(32)]));
};

export const verifySignature = async (signature: string, message: string, pubkey: Uint8Array) => {
  const { Secp256k1, Secp256k1Signature } = await import("@cosmjs/crypto");
  const secpSignature = Secp256k1Signature.fromFixedLength(base64.decode(signature));

  return Secp256k1.verifySignature(secpSignature, base64.decode(message), pubkey);
};

export const BaseThorchainToolbox = ({
  chain,
  stagenet,
}: ToolboxParams & {
  chain: Chain.THORChain | Chain.Maya;
}): ThorchainToolboxType => {
  const isThorchain = chain === Chain.THORChain;
  const chainId = isThorchain ? ChainId.THORChain : ChainId.Maya;
  const nodeUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;
  const prefix = `${stagenet ? "s" : ""}${chain.toLowerCase()}`;
  const derivationPath = DerivationPath[chain];
  const rpcUrl = getRPC(chainId, stagenet);

  const client = new CosmosClient({
    server: nodeUrl,
    chainId,
    prefix,
    stagenet,
  });
  const defaultFee = getDefaultChainFee(chain);

  const baseToolbox: {
    createPrivateKeyFromPhrase: (phrase: string) => Promise<Uint8Array>;
    getAccount: (address: string) => Promise<Account | null>;
    validateAddress: (address: string) => Promise<boolean>;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
    getBalance: (address: string, potentialScamFilter?: boolean) => Promise<AssetValue[]>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
  } = BaseCosmosToolbox({
    client,
    derivationPath,
    decimal: BaseDecimal[chain],
  });

  const loadAddressBalances = async (address: string) => {
    try {
      const balances: AssetValue[] = await baseToolbox.getBalance(address);

      return balances;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const getFees = async () => {
    let fee: SwapKitNumber;

    const constantsUrl = `${nodeUrl}/${isThorchain ? "thorchain" : "mayachain"}/constants}`;

    try {
      const {
        int_64_values: { NativeTransactionFee: nativeFee },
      } = await RequestClient.get<ThorchainConstantsResponse>(constantsUrl);

      // validate data
      if (!nativeFee || Number.isNaN(nativeFee) || nativeFee < 0)
        throw Error(`Invalid nativeFee: ${nativeFee.toString()}`);

      fee = new SwapKitNumber(nativeFee);
    } catch {
      fee = new SwapKitNumber({
        value: isThorchain ? 0.02 : 1,
        decimal: BaseDecimal[chain],
      });
    }

    return {
      [FeeOption.Average]: fee,
      [FeeOption.Fast]: fee,
      [FeeOption.Fastest]: fee,
    };
  };

  const transfer = async ({
    from,
    recipient,
    assetValue,
    memo = "",
    signer,
  }: Omit<TransferParams, "recipient"> & { recipient?: string }) => {
    if (!signer) throw new Error("Signer not defined");

    const registry = await createDefaultRegistry();
    const signingClient = await createSigningStargateClient(rpcUrl, signer, {
      registry,
    });

    const msgSign = await convertToSignable(
      prepareMessageForBroadcast(buildAminoMsg({ assetValue, from, recipient, memo })),
    );

    const txResponse = await signingClient.signAndBroadcast(from, [msgSign], defaultFee, memo);

    return txResponse.transactionHash;
  };

  const verifySignatureInToolbox = async (signature: string, message: string, address: string) => {
    const account = await baseToolbox.getAccount(address);
    if (!account?.pubkey) throw new Error("Public key not found");
    return verifySignature(signature, message, account.pubkey.value);
  };

  return {
    ...baseToolbox,
    deposit: (params: DepositParam & { from: string }) => transfer(params),
    transfer,
    getFees,
    buildAminoMsg,
    convertToSignable,
    buildTransaction,
    buildEncodedTxBody,
    prepareMessageForBroadcast,
    createDefaultAminoTypes,
    createDefaultRegistry,
    secp256k1HdWalletFromMnemonic: secp256k1HdWalletFromMnemonic({
      derivationPath,
      prefix,
    }),
    signMultisigTx,
    broadcastMultisigTx: broadcastMultisigTx({ prefix, rpcUrl }),
    createMultisig,
    importSignature,
    loadAddressBalances,
    pubkeyToAddress: __REEXPORT__pubkeyToAddress(prefix),
    signMessage,
    verifySignature: verifySignatureInToolbox,
  };
};

export const ThorchainToolbox = ({ stagenet }: ToolboxParams = {}): ThorchainToolboxType => {
  return BaseThorchainToolbox({ chain: Chain.THORChain, stagenet });
};

export const MayaToolbox = ({ stagenet }: ToolboxParams = {}): MayaToolboxType => {
  return BaseThorchainToolbox({ chain: Chain.Maya, stagenet });
};

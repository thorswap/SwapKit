import { type ApiPromise, Keyring } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import type { Callback, IKeyringPair, ISubmittableResult } from "@polkadot/types/types";
import { hexToU8a, isHex, u8aToHex } from "@polkadot/util";
import {
  cryptoWaitReady,
  decodeAddress as decodePolkadotAddress,
  encodeAddress as encodePolkadotAddress,
} from "@polkadot/util-crypto";
import { type AssetValue, SwapKitNumber } from "@swapkit/helpers";

import type { SubstrateNetwork } from "../types/network.ts";

// TODO combine this type with the more general SK type
type SubstrateTransferParams = {
  recipient: string;
  assetValue: AssetValue;
  from?: string;
};

export const createKeyring = async (phrase: string, networkPrefix: number) => {
  await cryptoWaitReady();

  return new Keyring({ type: "sr25519", ss58Format: networkPrefix }).addFromUri(phrase);
};

const getNonce = (api: ApiPromise, address: string) => api.rpc.system.accountNextIndex(address);

const getBalance = async (api: ApiPromise, gasAsset: AssetValue, address: string) => {
  const data = await api.query.system?.account?.(address);

  // @ts-expect-error @Towan some parts of data missing?
  if (!data?.data?.free || data?.data?.isEmpty) {
    return [gasAsset.set(0)];
  }

  return [
    gasAsset.set(
      // @ts-expect-error @Towan some parts of data missing?
      SwapKitNumber.fromBigInt(BigInt(data.data.free.toString()), gasAsset.decimal).getValue(
        "string",
      ),
    ),
  ];
};

const validateAddress = (address: string, networkPrefix: number) => {
  try {
    const decodedAddress = decodeAddress(address, networkPrefix);

    encodeAddress(decodedAddress, "ss58", networkPrefix);

    return true;
  } catch (_error) {
    return false;
  }
};

const createTransfer = (
  api: ApiPromise,
  { recipient, amount }: { recipient: string; amount: number },
) => api.tx.balances?.transferAllowDeath?.(recipient, amount);

const transfer = async (
  api: ApiPromise,
  signer: IKeyringPair,
  { recipient, assetValue, from }: SubstrateTransferParams,
) => {
  const transfer = createTransfer(api, {
    recipient,
    amount: assetValue.getBaseValue("number"),
  });

  const tx = await transfer?.signAndSend(signer, {
    nonce: await getNonce(api, from || signer.address),
  });

  return tx?.toString();
};

const estimateGasFee = async (
  api: ApiPromise,
  signer: IKeyringPair,
  gasAsset: AssetValue,
  { recipient, assetValue, from }: SubstrateTransferParams,
) => {
  const transfer = createTransfer(api, { recipient, amount: assetValue.getBaseValue("number") });

  const paymentInfo = (await transfer?.paymentInfo(from || signer.address, {
    nonce: await getNonce(api, from || signer.address),
  })) || { partialFee: 0 };

  return gasAsset.set(
    SwapKitNumber.fromBigInt(BigInt(paymentInfo.partialFee.toString()), gasAsset.decimal).getValue(
      "string",
    ),
  );
};

const broadcast = async (
  tx: SubmittableExtrinsic<"promise">,
  callback?: Callback<ISubmittableResult>,
) => {
  if (callback) return tx.send(callback);
  const hash = await tx.send();
  return hash.toString();
};

const sign = async (signer: IKeyringPair, tx: SubmittableExtrinsic<"promise">) => {
  const signedTx = await tx.signAsync(signer);
  return signedTx;
};

const signAndBroadcast = (
  signer: IKeyringPair,
  tx: SubmittableExtrinsic<"promise">,
  callback?: Callback<ISubmittableResult>,
) => {
  if (callback) return tx.signAndSend(signer, callback);
  const hash = tx.signAndSend(signer);
  return hash.toString();
};

function decodeAddress(address: string, networkPrefix?: number) {
  return isHex(address)
    ? hexToU8a(address)
    : decodePolkadotAddress(address, undefined, networkPrefix);
}

function encodeAddress(
  address: Uint8Array,
  encoding: "ss58" | "hex" = "ss58",
  networkPrefix?: number,
) {
  if (encoding === "hex") {
    return u8aToHex(address);
  }
  return encodePolkadotAddress(address, networkPrefix);
}

// Temporarily commented out forced typing
// : Promise<{
//   api: ApiPromise;
//   network: SubstrateNetwork;
//   decodeAddress: (address: string, networkPrefix?: number) => Promise<Uint8Array>;
//   encodeAddress: (
//     address: Uint8Array,
//     encoding?: "ss58" | "hex",
//     networkPrefix?: number,
//   ) => Promise<string>;
//   createKeyring: (phrase: string) => Promise<KeyringPair>;
//   getAddress: (signer?: KeyringPair) => string;
//   createTransfer: ({
//     recipient,
//     assetValue,
//   }: {
//     recipient: string;
//     assetValue: AssetValue;
//   }) => SubmittableExtrinsic<"promise">;
//   getBalance: (address: string) => Promise<AssetValue[]>;
//   validateAddress: (address: string) => Promise<boolean>;
//   transfer: (params: SubstrateTransferParams) => Promise<string>;
//   estimateGasFee: (params: SubstrateTransferParams) => Promise<AssetValue>;
//   sign: (tx: SubmittableExtrinsic<"promise">) => Promise<SubmittableExtrinsic<"promise">>;
//   broadcast: (
//     tx: SubmittableExtrinsic<"promise">,
//     callback?: Callback<ISubmittableResult>,
//   ) => Promise<string | (() => void)>;
//   signAndBroadcast: (
//     tx: SubmittableExtrinsic<"promise">,
//     callback?: Callback<ISubmittableResult>,
//   ) => Promise<string | (() => void)>;
// }>

export const BaseSubstrateToolbox = async ({
  api,
  network,
  gasAsset,
  signer,
}: {
  api: ApiPromise;
  network: SubstrateNetwork;
  gasAsset: AssetValue;
  signer: IKeyringPair;
}) => ({
  api,
  network,
  decodeAddress,
  encodeAddress,
  createKeyring: async (phrase: string) => createKeyring(phrase, network.prefix),
  getAddress: (keyring: IKeyringPair = signer) => keyring.address,
  createTransfer: ({ recipient, assetValue }: { recipient: string; assetValue: AssetValue }) =>
    createTransfer(api, { recipient, amount: assetValue.getBaseValue("number") }),
  getBalance: async (address: string) => getBalance(api, gasAsset, address),
  validateAddress: async (address: string) => validateAddress(address, network.prefix),
  transfer: async (params: SubstrateTransferParams) => transfer(api, signer, params),
  estimateGasFee: async (params: SubstrateTransferParams) =>
    estimateGasFee(api, signer, gasAsset, params),
  sign: async (tx: SubmittableExtrinsic<"promise">) => sign(signer, tx),
  broadcast: async (tx: SubmittableExtrinsic<"promise">, callback?: Callback<ISubmittableResult>) =>
    broadcast(tx, callback),
  signAndBroadcast: async (
    tx: SubmittableExtrinsic<"promise">,
    callback?: Callback<ISubmittableResult>,
  ) => signAndBroadcast(signer, tx, callback),
});

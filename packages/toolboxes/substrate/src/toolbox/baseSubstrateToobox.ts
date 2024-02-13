import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Callback, IKeyringPair, ISubmittableResult } from '@polkadot/types/types';
import type { AssetValue } from '@swapkit/helpers';

import type { SubstrateNetwork } from '../types/network.ts';

// TODO combine this type with the more general SK type
type SubstrateTransferParams = {
  recipient: string;
  assetValue: AssetValue;
  from?: string;
};

export const createKeyring = async (phrase: string, networkPrefix: number) => {
  const { cryptoWaitReady } = await import('@polkadot/util-crypto');
  const { Keyring } = await import('@polkadot/api');
  await cryptoWaitReady();

  return new Keyring({ type: 'sr25519', ss58Format: networkPrefix }).addFromUri(phrase);
};

const getNonce = (api: ApiPromise, address: string) => api.rpc.system.accountNextIndex(address);

const getBalance = async (api: ApiPromise, gasAsset: AssetValue, address: string) => {
  const { SwapKitNumber } = await import('@swapkit/helpers');
  const data = (await api.query.system.account(address)) as any;
  if (!data?.data?.free || data?.data?.isEmpty) return [gasAsset.set(0)];
  return [
    gasAsset.set(
      SwapKitNumber.fromBigInt(BigInt(data.data.free.toString()), gasAsset.decimal).getValue(
        'string',
      ),
    ),
  ];
};

const validateAddress = async (address: string, networkPrefix: number) => {
  const { encodeAddress, decodeAddress } = await import('@polkadot/util-crypto');
  const { isHex, hexToU8a } = await import('@polkadot/util');
  try {
    encodeAddress(
      isHex(address) ? hexToU8a(address) : decodeAddress(address, undefined, networkPrefix),
      networkPrefix,
    );

    return true;
  } catch (error) {
    return false;
  }
};

const createTransfer = (
  api: ApiPromise,
  { recipient, amount }: { recipient: string; amount: number },
): SubmittableExtrinsic<'promise'> => api.tx.balances.transfer(recipient, amount);

const transfer = async (
  api: ApiPromise,
  signer: IKeyringPair,
  { recipient, assetValue, from }: SubstrateTransferParams,
) => {
  const transfer = await createTransfer(api, {
    recipient,
    amount: assetValue.getBaseValue('number'),
  });

  return (
    await transfer.signAndSend(signer, { nonce: await getNonce(api, from || signer.address) })
  ).toString();
};

const estimateGasFee = async (
  api: ApiPromise,
  signer: IKeyringPair,
  gasAsset: AssetValue,
  { recipient, assetValue, from }: SubstrateTransferParams,
) => {
  const { SwapKitNumber } = await import('@swapkit/helpers');
  const transfer = createTransfer(api, { recipient, amount: assetValue.getBaseValue('number') });

  const paymentInfo = await transfer.paymentInfo(from || signer.address, {
    nonce: await getNonce(api, from || signer.address),
  });

  return gasAsset.set(
    SwapKitNumber.fromBigInt(BigInt(paymentInfo.partialFee.toString()), gasAsset.decimal).getValue(
      'string',
    ),
  );
};

const broadcast = async (
  tx: SubmittableExtrinsic<'promise'>,
  callback?: Callback<ISubmittableResult>,
) => {
  if (callback) return tx.send(callback);
  const hash = await tx.send();
  return hash.toString();
};

const sign = async (signer: IKeyringPair, tx: SubmittableExtrinsic<'promise'>) => {
  const signedTx = await tx.signAsync(signer);
  return signedTx;
};

const signAndBroadcast = async (
  signer: IKeyringPair,
  tx: SubmittableExtrinsic<'promise'>,
  callback?: Callback<ISubmittableResult>,
) => {
  if (callback) return tx.signAndSend(signer, callback);
  const hash = tx.signAndSend(signer);
  return hash.toString();
};

export const BaseToolbox = async ({
  api,
  network,
  gasAsset,
  signer,
}: {
  api: ApiPromise;
  network: SubstrateNetwork;
  gasAsset: AssetValue;
  signer: IKeyringPair;
}): Promise<{
  api: ApiPromise;
  network: SubstrateNetwork;
  createKeyring: (phrase: string) => Promise<KeyringPair>;
  getAddress: (signer?: KeyringPair) => string;
  createTransfer: ({
    recipient,
    assetValue,
  }: {
    recipient: string;
    assetValue: AssetValue;
  }) => SubmittableExtrinsic<'promise'>;
  getBalance: (address: string) => Promise<AssetValue[]>;
  validateAddress: (address: string) => Promise<boolean>;
  transfer: (params: SubstrateTransferParams) => Promise<string>;
  estimateGasFee: (params: SubstrateTransferParams) => Promise<AssetValue>;
  sign: (tx: SubmittableExtrinsic<'promise'>) => Promise<SubmittableExtrinsic<'promise'>>;
  broadcast: (
    tx: SubmittableExtrinsic<'promise'>,
    callback?: Callback<ISubmittableResult>,
  ) => Promise<string | (() => void)>;
  signAndBroadcast: (
    tx: SubmittableExtrinsic<'promise'>,
    callback?: Callback<ISubmittableResult>,
  ) => Promise<string | (() => void)>;
}> => ({
  api,
  network,
  createKeyring: async (phrase: string) => createKeyring(phrase, network.prefix),
  getAddress: (keyring: IKeyringPair = signer) => keyring.address,
  createTransfer: ({ recipient, assetValue }: { recipient: string; assetValue: AssetValue }) =>
    createTransfer(api, { recipient, amount: assetValue.getBaseValue('number') }),
  getBalance: async (address: string) => getBalance(api, gasAsset, address),
  validateAddress: async (address: string) => validateAddress(address, network.prefix),
  transfer: async (params: SubstrateTransferParams) => transfer(api, signer, params),
  estimateGasFee: async (params: SubstrateTransferParams) =>
    estimateGasFee(api, signer, gasAsset, params),
  sign: async (tx: SubmittableExtrinsic<'promise'>) => sign(signer, tx),
  broadcast: async (tx: SubmittableExtrinsic<'promise'>, callback?: Callback<ISubmittableResult>) =>
    broadcast(tx, callback),
  signAndBroadcast: async (
    tx: SubmittableExtrinsic<'promise'>,
    callback?: Callback<ISubmittableResult>,
  ) => signAndBroadcast(signer, tx, callback),
});

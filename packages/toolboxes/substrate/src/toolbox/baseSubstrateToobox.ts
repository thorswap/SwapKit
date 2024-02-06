import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { checkAddress, cryptoWaitReady, encodeAddress, decodeAddress } from '@polkadot/util-crypto';
import { isHex, hexToU8a } from '@polkadot/util';
import { AssetValue, SwapKitNumber } from '@swapkit/helpers';
import { RPCUrl } from '@swapkit/types';
import { Network, SubstrateNetwork } from '../types/network.ts';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { KeyringPair } from '@polkadot/keyring/types';

type SubstrateTransferParams = {
  recipient: string;
  assetValue: AssetValue;
  from?: string;
};

export const createKeyring = async (phrase: string, networkPrefix: number) => {
  await cryptoWaitReady();
  return new Keyring({ type: 'sr25519', ss58Format: networkPrefix }).addFromUri(phrase);
};

const getNonce = (api: ApiPromise, address: string) => api.rpc.system.accountNextIndex(address);

const getBalance = async (api: ApiPromise, gasAsset: string, address: string) => {
  const data = await api.query.system.account(address);
  const asset = AssetValue.fromStringSync(gasAsset, '0');
  if (!data.data?.free || data?.data?.isEmpty) return [asset];
  return [
    asset.set(
      SwapKitNumber.fromBigInt(BigInt(data.data.free.toString()), asset.decimal).getValue('string'),
    ),
  ];
};

const validateAddress = (address: string, networkPrefix: number) => {
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
  signer: KeyringPair,
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
  signer: KeyringPair,
  gasAsset: string,
  { recipient, assetValue, from }: SubstrateTransferParams,
) => {
  const transfer = createTransfer(api, { recipient, amount: assetValue.getBaseValue('number') });

  const paymentInfo = await transfer.paymentInfo(from || signer.address, {
    nonce: await getNonce(api, from || signer.address),
  });

  const asset = AssetValue.fromStringSync(gasAsset);

  return asset.set(
    SwapKitNumber.fromBigInt(BigInt(paymentInfo.partialFee.toString())).getValue('string'),
  );
};

const signAndBroadcast = async (signer: KeyringPair, tx: SubmittableExtrinsic<'promise'>) =>
  (await tx.signAndSend(signer)).toString();

const broadcastTx = async (tx: SubmittableExtrinsic<'promise'>) => (await tx.send()).toString();

export const BaseToolbox = async ({
  providerUrl,
  network = Network.GENERIC_SUBSTRATE,
  gasAsset,
  signer,
}: {
  providerUrl: RPCUrl;
  network: SubstrateNetwork;
  gasAsset: string;
  signer: KeyringPair;
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
  validateAddress: (address: string) => boolean;
  transfer: (params: SubstrateTransferParams) => Promise<string>;
  estimateGasFee: (params: SubstrateTransferParams) => Promise<AssetValue>;
  signAndBroadcast: (tx: SubmittableExtrinsic<'promise'>) => Promise<string>;
  broadcastTx: (tx: SubmittableExtrinsic<'promise'>) => Promise<string>;
}> => {
  const provider = new WsProvider(providerUrl);
  const api = await ApiPromise.create({ provider });
  console.log(
    Object.keys(api.tx),
    Object.keys(api.tx.swapping),
    api.tx.swapping,
    api.tx.swapping.registerAsBroker,
  );
  await cryptoWaitReady();

  return {
    api,
    network,
    createKeyring: async (phrase: string) => createKeyring(phrase, network.prefix),
    getAddress: (keyring: KeyringPair = signer) => signer.address,
    createTransfer: ({ recipient, assetValue }: { recipient: string; assetValue: AssetValue }) =>
      createTransfer(api, { recipient, amount: assetValue.getBaseValue('number') }),
    getBalance: async (address: string) => getBalance(api, gasAsset, address),
    validateAddress: (address: string) => validateAddress(address, network.prefix),
    transfer: async (params: SubstrateTransferParams) => transfer(api, signer, params),
    estimateGasFee: async (params: SubstrateTransferParams) =>
      estimateGasFee(api, signer, gasAsset, params),
    signAndBroadcast: async (tx: SubmittableExtrinsic<'promise'>) => signAndBroadcast(signer, tx),
    broadcastTx: async (tx: SubmittableExtrinsic<'promise'>) => broadcastTx(tx),
  };
};

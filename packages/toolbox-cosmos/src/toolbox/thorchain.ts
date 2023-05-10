import { cosmosclient, proto, rest } from '@cosmos-client/core';
import {
  assetAmount,
  assetToBase,
  baseAmount,
  getRequest,
  getTcChainId,
  getTcNodeUrl,
  singleFee,
} from '@thorswap-lib/helpers';
import { Amount, AmountType, AssetAmount, AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Balance, BaseDecimal, Chain, ChainId, DerivationPath, Fees } from '@thorswap-lib/types';
import { fromByteArray, toByteArray } from 'base64-js';
import Long from 'long';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import {
  DepositParam,
  ThorchainConstantsResponse,
  ThorchainToolboxType,
} from '../thorchainUtils/types/client-types.js';
import types from '../thorchainUtils/types/proto/MsgCompiled.js';
import {
  buildDepositTx,
  buildUnsignedTx,
  checkBalances,
  DEFAULT_GAS_VALUE,
  getThorchainAsset,
  registerDespositCodecs,
  registerSendCodecs,
} from '../thorchainUtils/util.js';
import { AssetRuneNative, TransferParams } from '../types.js';

import { BaseCosmosToolbox } from './BaseCosmosToolbox.js';

type ToolboxParams = {
  stagenet?: boolean;
};

const getAssetFromBalance = ({ asset: { symbol, chain } }: Balance): AssetEntity => {
  const isSynth = symbol.includes('/');

  if (!isSynth) return new AssetEntity(chain, symbol);
  const [nativeChain, nativeSymbol] = symbol.split('/');
  return new AssetEntity(nativeChain?.toUpperCase() as Chain, nativeSymbol?.toUpperCase(), true);
};

const createMultisig = (pubKeys: string[], threshold: number) => {
  const pubKeyInstances = pubKeys.map(
    (pubKey) =>
      new proto.cosmos.crypto.secp256k1.PubKey({
        key: toByteArray(pubKey),
      }),
  );
  return new proto.cosmos.crypto.multisig.LegacyAminoPubKey({
    public_keys: pubKeyInstances.map((pubKeyInstance) => ({
      ...cosmosclient.codec.instanceToProtoAny(pubKeyInstance),
    })),
    threshold,
  });
};

const getMultisigAddress = (multisigPubKey: proto.cosmos.crypto.multisig.LegacyAminoPubKey) =>
  cosmosclient.AccAddress.fromPublicKey(multisigPubKey).toString();

const mergeSignatures = (signatures: Uint8Array[]) => {
  const multisig = proto.cosmos.crypto.multisig.v1beta1.MultiSignature.fromObject({ signatures });
  return proto.cosmos.crypto.multisig.v1beta1.MultiSignature.encode(multisig).finish();
};

const exportSignature = (signature: Uint8Array) => fromByteArray(signature);

const importSignature = (signature: string) => toByteArray(signature);

const exportMultisigTx = (txBuilder: cosmosclient.TxBuilder) => txBuilder.toProtoJSON();

const importMultisigTx = async (cosmosSdk: cosmosclient.CosmosSDK, tx: any) => {
  try {
    registerDespositCodecs();
    registerSendCodecs();
    if (typeof tx === 'string') {
      tx = JSON.parse(tx);
    }
    const messages = tx.body.messages.map((message: any) =>
      (message['@type'] as string).endsWith('MsgSend')
        ? types.types.MsgSend.fromObject(message)
        : types.types.MsgDeposit.fromObject(message),
    );

    const txBody = new proto.cosmos.tx.v1beta1.TxBody({
      messages: messages.map((message: any) => cosmosclient.codec.instanceToProtoAny(message)),
      memo: tx.body.memo,
    });

    const signerInfo = tx.auth_info.signer_infos[0];

    const multisig = new proto.cosmos.crypto.multisig.LegacyAminoPubKey({
      public_keys: signerInfo.public_key.public_keys.map((publicKey: any) =>
        cosmosclient.codec.instanceToProtoAny(
          new proto.cosmos.crypto.secp256k1.PubKey({
            key: toByteArray(publicKey.key),
          }),
        ),
      ),
      threshold: signerInfo.public_key.threshold,
    });

    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.instanceToProtoAny(multisig),
          mode_info: {
            multi: {
              bitarray: proto.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject({
                extra_bits_stored: signerInfo.mode_info.multi.bitarray.extra_bits_stored,
                elems: signerInfo.mode_info.multi.bitarray.elems,
              }),
              mode_infos: signerInfo.mode_info.multi.mode_infos.map(() => ({
                single: {
                  mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
                },
              })),
            },
          },
          sequence: Long.fromString(signerInfo.sequence),
        },
      ],
      fee: {
        ...tx.auth_info.fee,
        gas_limit: Long.fromString(tx.auth_info.fee.gas_limit),
      },
    });

    return new cosmosclient.TxBuilder(cosmosSdk, txBody, authInfo);
  } catch (e) {
    throw new Error(`Invalid transaction object: ${e}`);
  }
};

const broadcastMultisig = async (
  cosmosSdk: cosmosclient.CosmosSDK,
  tx: any,
  signatures: string[],
) => {
  const importedTx = await importMultisigTx(cosmosSdk, tx);

  const mergedSignature = mergeSignatures(
    signatures.map((signature) => importSignature(signature)),
  );

  importedTx.addSignature(mergedSignature);

  const res = await rest.tx.broadcastTx(cosmosSdk, {
    tx_bytes: importedTx.txBytes(),
    mode: rest.tx.BroadcastTxMode.Sync,
  });

  return res.data?.tx_response;
};

export const ThorchainToolbox = ({ stagenet }: ToolboxParams): ThorchainToolboxType => {
  const sdk = new CosmosSDKClient({
    server: getTcNodeUrl(stagenet),
    chainId: ChainId.Thorchain,
    prefix: stagenet ? 'sthor' : 'thor',
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    signAndBroadcast: CosmosSDKClient['signAndBroadcast'];
    getAccount: (
      address: string | cosmosclient.PubKey | Uint8Array,
    ) => Promise<proto.cosmos.auth.v1beta1.IBaseAccount>;
    validateAddress: (address: string) => boolean;
    createKeyPair: (phrase: string) => proto.cosmos.crypto.secp256k1.PrivKey;
    getAddressFromMnemonic: (phrase: string) => string;
    getBalance: (address: string, filterAssets?: AssetEntity[] | undefined) => Promise<Balance[]>;
    transfer: (params: TransferParams) => Promise<string>;
  } = BaseCosmosToolbox({
    sdk,
    derivationPath: DerivationPath.THOR,
    decimal: BaseDecimal.THOR,
    getAsset: getThorchainAsset,
  });

  const loadAddressBalances = async (address: string) => {
    try {
      const balances: Balance[] = await baseToolbox.getBalance(address);

      return balances.map((data) => {
        const asset = getAssetFromBalance(data);
        const amount = new Amount(
          data.amount.amount().toString(),
          AmountType.BASE_AMOUNT,
          asset.decimal,
        );
        return new AssetAmount(asset, amount);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const getFees = async (): Promise<Fees> => {
    try {
      const {
        int_64_values: { NativeTransactionFee: fee },
      } = await getRequest<ThorchainConstantsResponse>(
        `${getTcNodeUrl(stagenet)}/thorchain/constants`,
      );

      // validate data
      if (!fee || isNaN(fee) || fee < 0) throw Error(`Invalid fee: ${fee.toString()}`);

      return singleFee(baseAmount(fee));
    } catch {
      return singleFee(assetToBase(assetAmount(0.02, BaseDecimal.THOR)));
    }
  };

  const deposit = async ({
    privKey,
    asset = AssetRuneNative,
    amount,
    memo,
    from,
  }: DepositParam & { from: string; privKey: proto.cosmos.crypto.secp256k1.PrivKey }) => {
    const accAddress = await baseToolbox.getAccount(from);
    const balances = await baseToolbox.getBalance(from);
    const fees = await getFees();
    await checkBalances(balances, fees, amount, asset);
    const signerPubkey = privKey.pubKey();
    await checkBalances(balances, fees, amount, asset);

    const assetObj = asset.symbol.includes('/')
      ? {
          chain: (asset.symbol.split('/')[0] as any).toLowerCase(),
          symbol: asset.symbol.split('/')[1].toLowerCase(),
          ticker: asset.symbol.split('/')[1].toLowerCase(),
          synth: true,
        }
      : asset;

    const depositTxBody = await buildDepositTx({
      msgNativeTx: {
        memo: memo,
        signer: cosmosclient.AccAddress.fromString(from),
        coins: [{ asset: assetObj, amount: amount.amount().toString() }],
      },
      nodeUrl: getTcNodeUrl(stagenet),
      chainId: getTcChainId(stagenet),
    });

    const txBuilder = buildUnsignedTx({
      cosmosSdk: baseToolbox.sdk,
      txBody: depositTxBody,
      gasLimit: DEFAULT_GAS_VALUE,
      signerPubkey: cosmosclient.codec.instanceToProtoAny(signerPubkey),
      sequence: (accAddress.sequence as Long) || Long.ZERO,
    });

    return baseToolbox.signAndBroadcast(txBuilder, privKey, accAddress) || '';
  };

  return {
    ...baseToolbox,
    deposit,
    getAccAddress: cosmosclient.AccAddress.fromString,
    instanceToProto: cosmosclient.codec.instanceToProtoAny,
    getFees,

    createMultisig,
    getMultisigAddress,
    mergeSignatures,
    exportSignature,
    importSignature,
    exportMultisigTx,
    importMultisigTx,
    broadcastMultisig,
    loadAddressBalances,
  };
};

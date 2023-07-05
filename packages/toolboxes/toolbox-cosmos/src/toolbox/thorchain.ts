/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createMultisigThresholdPubkey,
  encodeSecp256k1Pubkey,
  MultisigThresholdPubkey,
  pubkeyToAddress,
  StdFee,
} from '@cosmjs/amino';
import { fromHex } from '@cosmjs/encoding';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { makeMultisignedTxBytes, SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { cosmosclient, proto } from '@cosmos-client/core';
import {
  baseAmount,
  getRequest,
  getTcChainId,
  getTcNodeUrl,
  getTcRpcUrl,
  singleFee,
} from '@thorswap-lib/helpers';
import { Amount, AmountType, AssetAmount, AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Balance, BaseDecimal, Chain, ChainId, DerivationPath, Fees } from '@thorswap-lib/types';
import { fromByteArray, toByteArray } from 'base64-js';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import {
  DepositParam,
  ThorchainConstantsResponse,
  ThorchainToolboxType,
} from '../thorchainUtils/types/client-types.js';
import {
  buildDepositTx,
  checkBalances,
  DEFAULT_GAS_VALUE,
  getThorchainAsset,
} from '../thorchainUtils/util.js';
import { AssetRuneNative, TransferParams } from '../types.js';

import { BaseCosmosToolbox } from './BaseCosmosToolbox.js';

const DEFAULT_FEE_MAINNET = {
  amount: [{ denom: 'rune', amount: '20000000' }],
  gas: DEFAULT_GAS_VALUE,
};

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
  // TODO: Check if thats hex or some encoding
  const pubKeyInstances = pubKeys.map((pubKey) => encodeSecp256k1Pubkey(fromHex(pubKey)));

  return createMultisigThresholdPubkey(pubKeyInstances, threshold);
};

const getMultisigAddress = (multisigPubKey: MultisigThresholdPubkey) =>
  pubkeyToAddress(multisigPubKey, Chain.THORChain.toLowerCase());

// const mergeSignatures = (signatures: Uint8Array[]) => {
//   const multisig = proto.cosmos.crypto.multisig.v1beta1.MultiSignature.fromObject({ signatures });
//   return proto.cosmos.crypto.multisig.v1beta1.MultiSignature.encode(multisig).finish();
// };

const exportSignature = (signature: Uint8Array) => fromByteArray(signature);

const importSignature = (signature: string) => toByteArray(signature);

// const exportMultisigTx = (txBuilder: cosmosclient.TxBuilder) => txBuilder.toProtoJSON();

// const importMultisigTx = async (cosmosSdk: cosmosclient.CosmosSDK, tx: any) => {
//   try {
//     registerDespositCodecs();
//     registerSendCodecs();
//     if (typeof tx === 'string') {
//       tx = JSON.parse(tx);
//     }
//     const messages = tx.body.messages.map((message: any) =>
//       (message['@type'] as string).endsWith('MsgSend')
//         ? types.types.MsgSend.fromObject(message)
//         : types.types.MsgDeposit.fromObject(message),
//     );

//     const txBody = new proto.cosmos.tx.v1beta1.TxBody({
//       messages: messages.map((message: any) => cosmosclient.codec.instanceToProtoAny(message)),
//       memo: tx.body.memo,
//     });

//     const signerInfo = tx.auth_info.signer_infos[0];

//     const multisig = new proto.cosmos.crypto.multisig.LegacyAminoPubKey({
//       public_keys: signerInfo.public_key.public_keys.map((publicKey: any) =>
//         cosmosclient.codec.instanceToProtoAny(
//           new proto.cosmos.crypto.secp256k1.PubKey({
//             key: toByteArray(publicKey.key),
//           }),
//         ),
//       ),
//       threshold: signerInfo.public_key.threshold,
//     });

//     const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
//       signer_infos: [
//         {
//           public_key: cosmosclient.codec.instanceToProtoAny(multisig),
//           mode_info: {
//             multi: {
//               bitarray: proto.cosmos.crypto.multisig.v1beta1.CompactBitArray.fromObject({
//                 extra_bits_stored: signerInfo.mode_info.multi.bitarray.extra_bits_stored,
//                 elems: signerInfo.mode_info.multi.bitarray.elems,
//               }),
//               mode_infos: signerInfo.mode_info.multi.mode_infos.map(() => ({
//                 single: {
//                   mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT,
//                 },
//               })),
//             },
//           },
//           sequence: Long.fromString(signerInfo.sequence),
//         },
//       ],
//       fee: {
//         ...tx.auth_info.fee,
//         gas_limit: Long.fromString(tx.auth_info.fee.gas_limit),
//       },
//     });

//     return new cosmosclient.TxBuilder(cosmosSdk, txBody, authInfo);
//   } catch (e) {
//     throw new Error(`Invalid transaction object: ${e}`);
//   }
// };
// const broadcastMultisig = async (
//   cosmosSdk: cosmosclient.CosmosSDK,
//   tx: any,
//   signatures: string[],
// ) => {
//   const importedTx = await importMultisigTx(cosmosSdk, tx);

//   const mergedSignature = mergeSignatures(
//     signatures.map((signature) => importSignature(signature)),
//   );

//   importedTx.addSignature(mergedSignature);

//   const res = await rest.tx.broadcastTx(cosmosSdk, {
//     tx_bytes: importedTx.txBytes(),
//     mode: rest.tx.BroadcastTxMode.Sync,
//   });

//   return res.data?.tx_response;
// };

const broadcastMultisigTransaction = async ({
  multisigPubKey,
  bodyBytes,
  signatures,
  fee = DEFAULT_FEE_MAINNET,
}: {
  multisigPubKey: MultisigThresholdPubkey;
  bodyBytes: any;
  signatures: Map<string, Uint8Array>;
  fee?: StdFee;
}) => {
  const client = await StargateClient.connect(getTcRpcUrl());
  const multisigAddress = getMultisigAddress(multisigPubKey);
  const accountOnChain = await client.getAccount(multisigAddress);

  const signedTx = makeMultisignedTxBytes(
    multisigPubKey,
    accountOnChain?.sequence || 0,
    fee,
    bodyBytes,
    signatures,
  );

  const response = await client.broadcastTx(signedTx);

  return response.transactionHash;
};

const signMultisigTransaction = async ({
  multisigPubKey,
  tx,
  signer,
  fee = DEFAULT_FEE_MAINNET,
  memo = '',
}: {
  multisigPubKey: MultisigThresholdPubkey;
  tx: any;
  signer: OfflineSigner;
  fee?: StdFee;
  memo?: string;
}) => {
  const client = await StargateClient.connect(getTcRpcUrl());
  const [{ address }] = await signer.getAccounts();
  const signingClient = await SigningStargateClient.connectWithSigner(getTcRpcUrl(), signer);
  const multisigAddress = getMultisigAddress(multisigPubKey);
  const accountOnChain = await client.getAccount(multisigAddress);

  return signingClient.sign(address, tx, fee, memo, {
    accountNumber: accountOnChain?.accountNumber || 0,
    sequence: accountOnChain?.sequence || 0,
    chainId: await client.getChainId(),
  });
};

const signAndBroadcastMultisigTransaction = async ({
  multisigPubKey,
  tx,
  signer,
  fee = DEFAULT_FEE_MAINNET,
  memo = '',
}: {
  multisigPubKey: MultisigThresholdPubkey;
  tx: any;
  signer: OfflineSigner;
  fee?: StdFee;
  memo?: string;
}) => {
  const client = await StargateClient.connect(getTcRpcUrl());
  const txRaw = await signMultisigTransaction({
    multisigPubKey,
    tx,
    signer,
    fee,
    memo,
  });

  const txBytes = TxRaw.encode(txRaw).finish();
  const result = await client.broadcastTx(txBytes);

  return result.transactionHash;
};

const getFees = async (stagenet?: boolean): Promise<Fees> => {
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
    return singleFee(baseAmount(0.02, BaseDecimal.THOR));
  }
};

export const ThorchainToolbox = ({ stagenet }: ToolboxParams = {}): ThorchainToolboxType => {
  const sdk = new CosmosSDKClient({
    server: getTcNodeUrl(stagenet),
    chainId: ChainId.THORChain,
    prefix: stagenet ? 'sthor' : 'thor',
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    signAndBroadcast: CosmosSDKClient['signAndBroadcast'];
    // getAccount: (
    //   address: string | cosmosclient.PubKey | Uint8Array,
    // ) => Promise<proto.cosmos.auth.v1beta1.IBaseAccount>;
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

  const deposit = async ({
    privKey,
    asset = AssetRuneNative,
    amount,
    memo,
    from,
  }: DepositParam & { from: string; privKey: proto.cosmos.crypto.secp256k1.PrivKey }) => {
    const client = await StargateClient.connect(getTcRpcUrl());
    const accAddress = await client.getAccount(from);

    const balances = await baseToolbox.getBalance(from);
    const fees = await getFees(stagenet);
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

    // const txBuilder = buildUnsignedTx({
    //   cosmosSdk: baseToolbox.sdk,
    //   txBody: depositTxBody,
    //   gasLimit: DEFAULT_GAS_VALUE,
    //   signerPubkey: cosmosclient.codec.instanceToProtoAny(signerPubkey),
    //   sequence: accAddress?.sequence || 0,
    // });

    // client.broadcastTx()

    // return baseToolbox.signAndBroadcast(txBuilder, privKey, accAddress) || '';
    return '';
  };

  return {
    ...baseToolbox,
    deposit,
    getAccAddress: cosmosclient.AccAddress.fromString,
    instanceToProto: cosmosclient.codec.instanceToProtoAny,
    getFees,

    getMultisigAddress,
    exportSignature,
    importSignature,
    // exportMultisigTx,
    // importMultisigTx,
    // broadcastMultisig,
    loadAddressBalances,

    createMultisig,
    // @ts-expect-error TODO: fix type
    broadcastMultisigTransaction,
    signAndBroadcastMultisigTransaction,
    signMultisigTransaction,
  };
};

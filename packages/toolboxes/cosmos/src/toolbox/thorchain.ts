import type { Pubkey, Secp256k1HdWallet } from '@cosmjs/amino';
import type { OfflineDirectSigner, TxBodyEncodeObject } from '@cosmjs/proto-signing';
import type { Account, StdFee } from '@cosmjs/stargate';
import { base64 } from '@scure/base';
import { AssetValue, RequestClient, SwapKitNumber } from '@swapkit/helpers';
import { ApiUrl, BaseDecimal, Chain, ChainId, DerivationPath, FeeOption } from '@swapkit/types';

import { CosmosClient } from '../cosmosClient.ts';
import type {
  DepositParam,
  MayaToolboxType,
  ThorchainConstantsResponse,
  ThorchainToolboxType,
} from '../thorchainUtils/types/client-types.ts';
import { base64ToBech32, bech32ToBase64 } from '../thorchainUtils/util.ts';
import type { Signer, ToolboxParams, TransferParams } from '../types.ts';
import {
  createOfflineStargateClient,
  createSigningStargateClient,
  createStargateClient,
  getDenom,
  getRPC,
} from '../util.ts';

import { BaseCosmosToolbox } from './BaseCosmosToolbox.ts';

const getDefaultChainFee = (chain: Chain.THORChain | Chain.Maya) => {
  switch (chain) {
    case Chain.Maya:
      return { amount: [], gas: '10000000000' };
    default:
      return { amount: [], gas: '500000000' };
  }
};

const secp256k1HdWalletFromMnemonic =
  ({ prefix, derivationPath }: { prefix: string; derivationPath: string }) =>
  async (mnemonic: string, index: number = 0) => {
    const { Secp256k1HdWallet } = await import('@cosmjs/amino');
    const { stringToPath } = await import('@cosmjs/crypto');

    return Secp256k1HdWallet.fromMnemonic(mnemonic, {
      hdPaths: [stringToPath(`${derivationPath}/${index}`)],
      prefix,
    });
  };

const createDefaultRegistry = async () => {
  const types = await import('../thorchainUtils/types/proto/MsgCompiled.ts');
  const { Registry } = await import('@cosmjs/proto-signing');
  const { defaultRegistryTypes } = await import('@cosmjs/stargate');

  return new Registry([
    ...defaultRegistryTypes,
    ['/types.MsgSend', { ...types.default.types.MsgSend }],
    ['/types.MsgDeposit', { ...types.default.types.MsgDeposit }],
  ]);
};

const createDefaultAminoTypes = async () => {
  const { AminoTypes } = await import('@cosmjs/stargate');

  return new AminoTypes({
    '/types.MsgSend': {
      aminoType: 'thorchain/MsgSend',
      toAmino: (params: any) => ({
        from_address: base64ToBech32(params.fromAddress),
        to_address: base64ToBech32(params.toAddress),
        amount: [...params.amount],
      }),
      fromAmino: (params: any) => ({
        fromAddress: bech32ToBase64(params.from_address),
        toAddress: bech32ToBase64(params.to_address),
        amount: [...params.amount],
      }),
    },
    '/types.MsgDeposit': {
      aminoType: 'thorchain/MsgDeposit',
      toAmino: (params: any) => ({
        signer: base64ToBech32(params.signer),
        memo: params.memo,
        coins: [...params.coins],
      }),
      fromAmino: (params: any) => ({
        signer: bech32ToBase64(params.signer),
        memo: params.memo,
        coins: [...params.coins],
      }),
    },
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

  const txBodyObject: TxBodyEncodeObject = {
    typeUrl: '/cosmos.tx.v1beta1.TxBody',
    value: {
      messages: msgs.map((msg: any) => {
        const isSend = msg.type === 'thorchain/MsgSend';
        const parsedMessage = isSend
          ? msg
          : {
              ...msg,
              type: 'thorchain/MsgDeposit',
              value: {
                ...msg.value,
                signer: base64ToBech32(msg.value.signer),
                coins: mapCoinsForBroadcasting(msg.value.coins),
              },
            };
        return aminoTypes.fromAmino(parsedMessage);
      }),
      memo,
    },
  };

  const bodyBytes = registry.encode(txBodyObject);

  const {
    signatures: [signature],
  } = await signingClient.sign(address, msgs, fee, memo, { accountNumber, sequence, chainId });

  return { signature: exportSignature(signature), bodyBytes };
};

const mapCoinsForBroadcasting = (coins: { amount: string; asset: string }[]) =>
  coins.map(({ asset, amount }) => {
    const { chain, symbol, isSynthetic } = AssetValue.fromStringSync(asset);
    return {
      amount,
      asset: {
        chain,
        symbol,
        ticker: symbol,
        synth: isSynthetic,
      },
    };
  });

const createDepositMessage = (
  assetValue: AssetValue,
  address: string,
  memo = '',
  forBroadcasting = false,
) => {
  const symbol = assetValue.isSynthetic
    ? assetValue.symbol.split('/')[1].toLowerCase()
    : assetValue.symbol.toLowerCase();
  const chain = assetValue.isSynthetic
    ? assetValue.symbol.split('/')[0].toLowerCase()
    : assetValue.chain.toLowerCase();

  return {
    type: 'thorchain/MsgDeposit',
    value: {
      coins: [
        {
          amount: assetValue.getBaseValue('string'),
          asset: !forBroadcasting
            ? assetValue.symbol
            : {
                chain,
                symbol,
                ticker: symbol,
                synth: assetValue.isSynthetic,
              },
        },
      ],
      memo,
      signer: address,
    },
  };
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

    const { pubkeyToAddress, encodeSecp256k1Pubkey } = await import('@cosmjs/amino');
    const { makeMultisignedTxBytes } = await import('@cosmjs/stargate');

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
  const { encodeSecp256k1Pubkey, createMultisigThresholdPubkey } = await import('@cosmjs/amino');
  return createMultisigThresholdPubkey(
    pubKeys.map((pubKey) => encodeSecp256k1Pubkey(base64.decode(pubKey))),
    threshold,
    noSortPubKeys,
  );
};

const importSignature = (signature: string) => base64.decode(signature);

const __REEXPORT__pubkeyToAddress = (prefix: string) => async (pubkey: Pubkey) => {
  const { pubkeyToAddress } = await import('@cosmjs/amino');

  return pubkeyToAddress(pubkey, prefix);
};

const signMessage = async (privateKey: Uint8Array, message: string) => {
  const { Secp256k1 } = await import('@cosmjs/crypto');

  const signature = await Secp256k1.createSignature(base64.decode(message), privateKey);
  return base64.encode(Buffer.concat([signature.r(32), signature.s(32)]));
};

export const verifySignature = async (signature: string, message: string, pubkey: Uint8Array) => {
  const { Secp256k1, Secp256k1Signature } = await import('@cosmjs/crypto');
  const secpSignature = Secp256k1Signature.fromFixedLength(base64.decode(signature));

  return Secp256k1.verifySignature(secpSignature, base64.decode(message), pubkey);
};

export const BaseThorchainToolbox = ({
  chain,
  stagenet,
}: ToolboxParams & { chain: Chain.THORChain | Chain.Maya }): ThorchainToolboxType => {
  const isThorchain = chain === Chain.THORChain;
  const chainId = isThorchain ? ChainId.THORChain : ChainId.Maya;
  const nodeUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;
  const prefix = `${stagenet ? 's' : ''}${chain.toLowerCase()}`;
  const derivationPath = DerivationPath[chain];
  const rpcUrl = getRPC(chainId, stagenet);

  const client = new CosmosClient({ server: nodeUrl, chainId, prefix, stagenet });
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
  } = BaseCosmosToolbox({ client, derivationPath, decimal: BaseDecimal[chain] });

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

    const constantsUrl = `${nodeUrl}/${isThorchain ? 'thorchain' : 'mayachain'}/constants}`;

    try {
      const {
        int_64_values: { NativeTransactionFee: nativeFee },
      } = await RequestClient.get<ThorchainConstantsResponse>(constantsUrl);

      // validate data
      if (!nativeFee || isNaN(nativeFee) || nativeFee < 0)
        throw Error(`Invalid nativeFee: ${nativeFee.toString()}`);

      fee = new SwapKitNumber(nativeFee);
    } catch {
      fee = new SwapKitNumber({ value: isThorchain ? 0.02 : 1, decimal: BaseDecimal[chain] });
    }

    return { [FeeOption.Average]: fee, [FeeOption.Fast]: fee, [FeeOption.Fastest]: fee };
  };

  const deposit = async ({ signer, assetValue, memo, from }: DepositParam & { from: string }) => {
    if (!signer) throw new Error('Signer not defined');

    const registry = await createDefaultRegistry();
    const signingClient = await createSigningStargateClient(rpcUrl, signer, { registry });

    const symbol = assetValue.isSynthetic
      ? assetValue.symbol.split('/')[1].toLowerCase()
      : assetValue.symbol.toLowerCase();
    const chain = assetValue.isSynthetic
      ? assetValue.symbol.split('/')[0].toLowerCase()
      : assetValue.chain.toLowerCase();

    const depositMsg = {
      typeUrl: '/types.MsgDeposit',
      value: {
        signer: bech32ToBase64(from),
        memo,
        coins: [
          {
            amount: assetValue.getBaseValue('string'),
            asset: {
              chain,
              symbol,
              ticker: symbol,
              synth: assetValue.isSynthetic,
            },
          },
        ],
      },
    };

    const txResponse = await signingClient.signAndBroadcast(from, [depositMsg], defaultFee, memo);

    return txResponse.transactionHash;
  };

  const transfer = async ({
    from,
    recipient,
    assetValue,
    memo = '',
    fee = defaultFee,
    signer,
  }: TransferParams) => {
    if (!signer) throw new Error('Signer not defined');

    const registry = await createDefaultRegistry();
    const signingClient = await createSigningStargateClient(rpcUrl, signer, { registry });

    const sendMsg = {
      typeUrl: '/types.MsgSend',
      value: {
        fromAddress: bech32ToBase64(from),
        toAddress: bech32ToBase64(recipient),
        amount: [
          {
            amount: assetValue.getBaseValue('string'),
            denom: getDenom(assetValue.symbol, true),
          },
        ],
      },
    };

    const txResponse = await signingClient.signAndBroadcast(from, [sendMsg], fee as StdFee, memo);

    return txResponse.transactionHash;
  };

  const verifySignatureInToolbox = async (signature: string, message: string, address: string) => {
    const account = await baseToolbox.getAccount(address);
    if (!account?.pubkey) throw new Error('Public key not found');
    return verifySignature(signature, message, account.pubkey.value);
  };

  return {
    ...baseToolbox,
    deposit,
    transfer,
    getFees,
    createDepositMessage,
    createDefaultAminoTypes,
    createDefaultRegistry,
    secp256k1HdWalletFromMnemonic: secp256k1HdWalletFromMnemonic({ derivationPath, prefix }),
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

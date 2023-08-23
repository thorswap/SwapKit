import { createMultisigThresholdPubkey, encodeSecp256k1Pubkey } from '@cosmjs/amino';
import { OfflineDirectSigner, Registry } from '@cosmjs/proto-signing';
import {
  Account,
  AminoTypes,
  defaultRegistryTypes,
  SigningStargateClient,
  StdFee,
} from '@cosmjs/stargate';
import { baseAmount, getRequest, singleFee } from '@thorswap-lib/helpers';
import { Amount, AmountType, AssetAmount, AssetEntity } from '@thorswap-lib/swapkit-entities';
import {
  ApiUrl,
  Balance,
  BaseDecimal,
  Chain,
  ChainId,
  DerivationPath,
  Fees,
} from '@thorswap-lib/types';
import { fromByteArray, toByteArray } from 'base64-js';

import { CosmosClient } from '../cosmosClient.js';
import {
  DepositParam,
  ThorchainConstantsResponse,
  ThorchainToolboxType,
} from '../thorchainUtils/types/client-types.js';
import types from '../thorchainUtils/types/proto/MsgCompiled.js';
import { base64ToBech32, bech32ToBase64, getThorchainAsset } from '../thorchainUtils/util.js';
import { AssetRuneNative, TransferParams } from '../types.js';
import { getRPC } from '../util.js';

import { BaseCosmosToolbox } from './BaseCosmosToolbox.js';

type ToolboxParams = {
  stagenet?: boolean;
};

const DEFAULT_THORCHAIN_FEE_MAINNET = {
  amount: [],
  gas: '500000000',
};

const createDefaultRegistry = () => {
  return new Registry([
    ...defaultRegistryTypes,
    ['/types.MsgSend', { ...types.types.MsgSend }],
    ['/types.MsgDeposit', { ...types.types.MsgDeposit }],
  ]);
};

const createDefaultAminoTypes = () =>
  new AminoTypes({
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

const getAssetFromBalance = ({ asset: { symbol, chain } }: Balance): AssetEntity => {
  const isSynth = symbol.includes('/');

  if (!isSynth) return new AssetEntity(chain, symbol);
  const [nativeChain, nativeSymbol] = symbol.split('/');
  return new AssetEntity(nativeChain?.toUpperCase() as Chain, nativeSymbol?.toUpperCase(), true);
};

const createMultisig = (pubKeys: string[], threshold: number) =>
  createMultisigThresholdPubkey(
    pubKeys.map((pubKey) => encodeSecp256k1Pubkey(toByteArray(pubKey))),
    threshold,
  );

const exportSignature = (signature: Uint8Array) => fromByteArray(signature);

const importSignature = (signature: string) => toByteArray(signature);

export const ThorchainToolbox = ({ stagenet }: ToolboxParams): ThorchainToolboxType => {
  const rpcUrl = getRPC(ChainId.THORChain, stagenet);
  const nodeUrl = stagenet ? ApiUrl.ThornodeStagenet : ApiUrl.ThornodeMainnet;

  const client = new CosmosClient({
    server: nodeUrl,
    chainId: ChainId.THORChain,
    prefix: stagenet ? 'sthor' : 'thor',
    stagenet,
  });

  const baseToolbox: {
    getAccount: (address: string) => Promise<Account | null>;
    validateAddress: (address: string) => boolean;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
    getBalance: (address: string) => Promise<Balance[]>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
  } = BaseCosmosToolbox({
    client,
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
      } = await getRequest<ThorchainConstantsResponse>(`${nodeUrl}/thorchain/constants`);

      // validate data
      if (!fee || isNaN(fee) || fee < 0) throw Error(`Invalid fee: ${fee.toString()}`);

      return singleFee(baseAmount(fee));
    } catch {
      return singleFee(baseAmount(0.02, BaseDecimal.THOR));
    }
  };

  const deposit = async ({
    signer,
    asset = AssetRuneNative,
    amount,
    memo,
    from,
  }: DepositParam & { from: string }) => {
    if (!signer) {
      throw new Error('Signer not defined');
    }

    const signingClient = await SigningStargateClient.connectWithSigner(rpcUrl, signer, {
      registry: createDefaultRegistry(),
    });

    const base64Address = bech32ToBase64(from);

    const assetObj = asset.symbol.includes('/')
      ? {
          chain: (asset.symbol.split('/')[0] as any).toLowerCase(),
          symbol: asset.symbol.split('/')[1].toLowerCase(),
          ticker: asset.symbol.split('/')[1].toLowerCase(),
          synth: true,
        }
      : asset;

    const depositMsg = {
      typeUrl: '/types.MsgDeposit',
      value: {
        signer: base64Address,
        memo,
        coins: [{ asset: assetObj, amount: amount.amount().toString() }],
      },
    };

    const txResponse = await signingClient.signAndBroadcast(
      from,
      [depositMsg],
      DEFAULT_THORCHAIN_FEE_MAINNET as StdFee,
      memo,
    );

    return txResponse.transactionHash;
  };

  const transfer = async ({
    from,
    to,
    amount,
    asset,
    memo = '',
    fee = DEFAULT_THORCHAIN_FEE_MAINNET,
    signer,
  }: TransferParams) => {
    if (!signer) {
      throw new Error('Signer not defined');
    }

    const signingClient = await SigningStargateClient.connectWithSigner(rpcUrl, signer, {
      registry: createDefaultRegistry(),
    });

    const base64From = bech32ToBase64(from);
    const base64To = bech32ToBase64(to);

    const sendMsg = {
      typeUrl: '/types.MsgSend',
      value: {
        fromAddress: base64From,
        toAddress: base64To,
        amount: [{ amount, denom: asset.toLowerCase() }],
      },
    };

    const txResponse = await signingClient.signAndBroadcast(from, [sendMsg], fee as StdFee, memo);

    return txResponse.transactionHash;
  };

  return {
    ...baseToolbox,
    deposit,
    transfer,
    getFees,
    createDefaultRegistry,
    createDefaultAminoTypes,

    createMultisig,
    exportSignature,
    importSignature,
    loadAddressBalances,
  };
};

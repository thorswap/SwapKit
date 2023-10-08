import type { Pubkey, Secp256k1HdWallet } from '@cosmjs/amino';
import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { Account, StdFee } from '@cosmjs/stargate';
import { base64 } from '@scure/base';
import type { AssetValue } from '@swapkit/helpers';
import { getRequest, SwapKitNumber } from '@swapkit/helpers';
import { ApiUrl, BaseDecimal, ChainId, DerivationPath, FeeOption, RPCUrl } from '@swapkit/types';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js';

import { CosmosClient } from '../cosmosClient.ts';
import type {
  DepositParam,
  ThorchainConstantsResponse,
  ThorchainToolboxType,
} from '../thorchainUtils/types/client-types.ts';
import { base64ToBech32, bech32ToBase64 } from '../thorchainUtils/util.ts';
import type { Signer, TransferParams } from '../types.ts';
import { getDenom, getRPC } from '../util.ts';

import { BaseCosmosToolbox } from './BaseCosmosToolbox.ts';

type ToolboxParams = {
  stagenet?: boolean;
};

const DEFAULT_THORCHAIN_FEE_MAINNET = {
  amount: [],
  gas: '500000000',
};

const secp256k1HdWalletFromMnemonic = async (
  mnemonic: string,
  path = `${DerivationPath.THOR}/0`,
  isStagenet = false,
) => {
  const { Secp256k1HdWallet } = await import('@cosmjs/amino');
  const { stringToPath } = await import('@cosmjs/crypto');

  return Secp256k1HdWallet.fromMnemonic(mnemonic, {
    hdPaths: [stringToPath(path)],
    prefix: isStagenet ? 'sthor' : 'thor',
  });
};

const createDefaultRegistry = async () => {
  const types = await import('../thorchainUtils/types/proto/MsgCompiled.js');
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
  const { SigningStargateClient } = await import('@cosmjs/stargate');
  const signingClient = await SigningStargateClient.offline(wallet, {
    registry: await createDefaultRegistry(),
    aminoTypes: await createDefaultAminoTypes(),
  });

  const {
    bodyBytes,
    signatures: [signature],
  } = await signingClient.sign(address, msgs, fee, memo, { accountNumber, sequence, chainId });

  return { signature: exportSignature(signature), bodyBytes };
};

const createDepositMessage = (
  assetValue: AssetValue,
  address: string,
  memo = '',
  forBroadcasting = false,
) => ({
  type: 'thorchain/MsgDeposit',
  value: {
    coins: [
      {
        amount: assetValue.baseValue,
        asset: !forBroadcasting ? assetValue.symbol : assetValue,
      },
    ],
    memo,
    signer: address,
  },
});

const broadcastMultisigTx = async (
  tx: string,
  signers: Signer[],
  threshold: number,
  bodyBytes: Uint8Array,
  isStagenet = false,
) => {
  const { sequence, fee } = JSON.parse(tx);
  const multisigPubkey = await createMultisig(
    signers.map((signer) => signer.pubKey),
    threshold,
  );

  const { pubkeyToAddress, encodeSecp256k1Pubkey } = await import('@cosmjs/amino');
  const { StargateClient, makeMultisignedTx } = await import('@cosmjs/stargate');

  const addressesAndSignatures: [string, Uint8Array][] = signers.map((signer) => [
    pubkeyToAddress(
      encodeSecp256k1Pubkey(base64.decode(signer.pubKey)),
      isStagenet ? 'sthor' : 'thor',
    ),
    base64.decode(signer.signature),
  ]);

  const broadcaster = await StargateClient.connect(
    isStagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
  );
  const signedTx = makeMultisignedTx(
    multisigPubkey,
    sequence,
    fee,
    bodyBytes,
    new Map<string, Uint8Array>(addressesAndSignatures),
  );

  const { transactionHash } = await broadcaster.broadcastTx(
    Uint8Array.from(TxRaw.encode(signedTx).finish()),
  );

  return transactionHash;
};

const createMultisig = async (pubKeys: string[], threshold: number) => {
  const { encodeSecp256k1Pubkey, createMultisigThresholdPubkey } = await import('@cosmjs/amino');
  return createMultisigThresholdPubkey(
    pubKeys.map((pubKey) => encodeSecp256k1Pubkey(base64.decode(pubKey))),
    threshold,
  );
};

const importSignature = (signature: string) => base64.decode(signature);

const __REEXPORT__pubkeyToAddress = async (pubkey: Pubkey, prefix = 'thor') => {
  const { pubkeyToAddress } = await import('@cosmjs/amino');

  return pubkeyToAddress(pubkey, prefix);
};

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
    validateAddress: (address: string) => Promise<boolean>;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
    getBalance: (address: string) => Promise<AssetValue[]>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
  } = BaseCosmosToolbox({
    client,
    derivationPath: DerivationPath.THOR,
    decimal: BaseDecimal.THOR,
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

    try {
      const {
        int_64_values: { NativeTransactionFee: nativeFee },
      } = await getRequest<ThorchainConstantsResponse>(`${nodeUrl}/thorchain/constants`);

      // validate data
      if (!nativeFee || isNaN(nativeFee) || nativeFee < 0)
        throw Error(`Invalid nativeFee: ${nativeFee.toString()}`);

      fee = new SwapKitNumber(nativeFee);
    } catch {
      fee = new SwapKitNumber({ value: 0.02, decimal: BaseDecimal.THOR });
    }

    return {
      [FeeOption.Average]: fee,
      [FeeOption.Fast]: fee,
      [FeeOption.Fastest]: fee,
    };
  };

  const deposit = async ({ signer, assetValue, memo, from }: DepositParam & { from: string }) => {
    if (!signer) {
      throw new Error('Signer not defined');
    }

    const { SigningStargateClient } = await import('@cosmjs/stargate');
    const signingClient = await SigningStargateClient.connectWithSigner(rpcUrl, signer, {
      registry: await createDefaultRegistry(),
    });

    const base64Address = bech32ToBase64(from);

    const assetObj = assetValue.symbol.includes('/')
      ? {
          chain: (assetValue.symbol.split('/')[0] as any).toLowerCase(),
          symbol: assetValue.symbol.split('/')[1].toLowerCase(),
          ticker: assetValue.symbol.split('/')[1].toLowerCase(),
          synth: true,
        }
      : assetValue;

    const depositMsg = {
      typeUrl: '/types.MsgDeposit',
      value: {
        signer: base64Address,
        memo,
        coins: [{ asset: assetObj, amount: assetValue.baseValue }],
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
    recipient,
    assetValue,
    memo = '',
    fee = DEFAULT_THORCHAIN_FEE_MAINNET,
    signer,
  }: TransferParams) => {
    if (!signer) {
      throw new Error('Signer not defined');
    }

    const { SigningStargateClient } = await import('@cosmjs/stargate');
    const signingClient = await SigningStargateClient.connectWithSigner(rpcUrl, signer, {
      registry: await createDefaultRegistry(),
    });

    const base64From = bech32ToBase64(from);
    const base64To = bech32ToBase64(recipient);

    const sendMsg = {
      typeUrl: '/types.MsgSend',
      value: {
        fromAddress: base64From,
        toAddress: base64To,
        amount: [
          {
            amount: assetValue.baseValueNumber.toString(),
            denom: getDenom(assetValue.symbol, true),
          },
        ],
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
    createDepositMessage,
    createDefaultAminoTypes,
    createDefaultRegistry,
    secp256k1HdWalletFromMnemonic,
    signMultisigTx,
    broadcastMultisigTx,
    createMultisig,
    importSignature,
    loadAddressBalances,
    pubkeyToAddress: __REEXPORT__pubkeyToAddress,
  };
};

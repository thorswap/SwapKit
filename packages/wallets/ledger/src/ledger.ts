import { fromBase64 } from '@cosmjs/encoding';
import { Int53 } from '@cosmjs/math';
import { encodePubkey, makeAuthInfoBytes, type TxBodyEncodeObject } from '@cosmjs/proto-signing';
import { type DepositParam, type TransferParams } from '@swapkit/toolbox-cosmos';
import type { UTXOBuildTxParams } from '@swapkit/toolbox-utxo';
import type { ConnectWalletParams, DerivationPathArray } from '@swapkit/types';
import { Chain, ChainId, FeeOption, RPCUrl, WalletOption } from '@swapkit/types';
import { SignMode } from 'cosmjs-types/cosmos/tx/signing/v1beta1/signing.js';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx.js';

import type { AvalancheLedger } from './clients/avalanche.ts';
import type { BinanceLedger } from './clients/binance/index.ts';
import type { BSCLedger } from './clients/binancesmartchain.ts';
import type { BitcoinLedger } from './clients/bitcoin.ts';
import type { BitcoinCashLedger } from './clients/bitcoincash.ts';
import type { CosmosLedger } from './clients/cosmos.ts';
import type { DogecoinLedger } from './clients/dogecoin.ts';
import type { EthereumLedger } from './clients/ethereum.ts';
import type { LitecoinLedger } from './clients/litecoin.ts';
import type { THORChainLedger } from './clients/thorchain/index.ts';
import type { LEDGER_SUPPORTED_CHAINS } from './helpers/index.ts';
import { getLedgerAddress, getLedgerClient } from './helpers/index.ts';

type LedgerConfig = {
  api?: any;
  rpcUrl?: string;
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
};

const THORCHAIN_DEPOSIT_GAS_FEE = '500000000';
const THORCHAIN_SEND_GAS_FEE = '500000000';
// reduce memo length by removing trade limit
const reduceMemo = (memo?: string, affiliateAddress = 't') => {
  if (!memo?.includes('=:')) return memo;

  const removedAffiliate = memo.includes(`:${affiliateAddress}:`)
    ? memo.split(`:${affiliateAddress}:`)[0]
    : memo;
  return removedAffiliate.substring(0, removedAffiliate.lastIndexOf(':'));
};

const recursivelyOrderKeys = (unordered: any) => {
  // If it's an array - recursively order any
  // dictionary items within the array
  if (Array.isArray(unordered)) {
    unordered.forEach((item, index) => {
      unordered[index] = recursivelyOrderKeys(item);
    });
    return unordered;
  }

  // If it's an object - let's order the keys
  if (typeof unordered !== 'object') return unordered;
  const ordered: any = {};
  Object.keys(unordered)
    .sort()
    .forEach((key) => (ordered[key] = recursivelyOrderKeys(unordered[key])));
  return ordered;
};

const stringifyKeysInOrder = (data: any) => JSON.stringify(recursivelyOrderKeys(data));

const getToolbox = async ({
  api,
  rpcUrl,
  address,
  chain,
  covalentApiKey,
  ethplorerApiKey,
  blockchairApiKey,
  signer,
  derivationPath,
  stagenet = false,
}: LedgerConfig & {
  address: string;
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  signer:
    | AvalancheLedger
    | BinanceLedger
    | BSCLedger
    | BitcoinLedger
    | BitcoinCashLedger
    | DogecoinLedger
    | EthereumLedger
    | LitecoinLedger
    | THORChainLedger
    | CosmosLedger;
  derivationPath?: DerivationPathArray;
  stagenet?: boolean;
}) => {
  const utxoParams = { apiKey: blockchairApiKey, rpcUrl, apiClient: api };

  switch (chain) {
    case Chain.Bitcoin: {
      const { BTCToolbox } = await import('@swapkit/toolbox-utxo');
      const toolbox = BTCToolbox(utxoParams);

      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = params.feeRate || (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          sender: address,
          feeRate,
          fetchTxHex: true,
        });
        const txHex = await (signer as BitcoinLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.BitcoinCash: {
      const { BCHToolbox } = await import('@swapkit/toolbox-utxo');
      const toolbox = BCHToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });

        const txHex = await (signer as BitcoinCashLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Dogecoin: {
      const { DOGEToolbox } = await import('@swapkit/toolbox-utxo');
      const toolbox = DOGEToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as DogecoinLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Litecoin: {
      const { LTCToolbox } = await import('@swapkit/toolbox-utxo');
      const toolbox = LTCToolbox(utxoParams);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = await (await toolbox.getFeeRates())[FeeOption.Average];
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as LitecoinLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx(txHex);
      };
      return { ...toolbox, transfer };
    }
    case Chain.Binance: {
      const { BinanceToolbox } = await import('@swapkit/toolbox-cosmos');
      const toolbox = BinanceToolbox({ stagenet: false });
      const transfer = async (params: any) => {
        const { transaction, signMsg } = await toolbox.createTransactionAndSignMsg({
          ...params,
          to: params.recipient,
          amount: params.amount.amount().toString(),
          asset: params.asset.symbol,
        });
        const signBytes = transaction.getSignBytes(signMsg);
        const pubKeyResponse = await (signer as BinanceLedger).ledgerApp.getPublicKey(
          derivationPath,
        );
        const signResponse = await (signer as BinanceLedger).ledgerApp.sign(
          signBytes,
          derivationPath,
        );

        const pubKey = toolbox.getPublicKey(pubKeyResponse!.pk!.toString('hex'));
        const signedTx = transaction.addSignature(pubKey, signResponse!.signature);

        const res = await toolbox.sendRawTransaction(signedTx.serialize(), true);

        return res[0]?.hash;
      };
      return { ...toolbox, transfer };
    }

    case Chain.Cosmos: {
      const { createSigningStargateClient, getDenom, GaiaToolbox } = await import(
        '@swapkit/toolbox-cosmos'
      );
      const toolbox = GaiaToolbox();
      const transfer = async ({ assetValue, recipient, memo }: TransferParams) => {
        const from = address;
        if (!assetValue) throw new Error('invalid asset');
        // ANCHOR (@0xGeneral) - create fallback for gas price estimation if internal api has error
        const gasPrice = '0.007uatom';

        const sendCoinsMessage = {
          amount: [
            {
              amount: assetValue.getBaseValue('string'),
              denom: getDenom(`u${assetValue.symbol}`).toLowerCase(),
            },
          ],
          fromAddress: from,
          toAddress: recipient,
        };

        const msg = {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: sendCoinsMessage,
        };

        const { GasPrice } = await import('@cosmjs/stargate');

        const signingClient = await createSigningStargateClient(
          RPCUrl.Cosmos,
          signer as CosmosLedger,
          { gasPrice: GasPrice.fromString(gasPrice) },
        );

        const tx = await signingClient.signAndBroadcast(address, [msg], 'auto', memo);

        return tx.transactionHash;
      };

      return { ...toolbox, transfer };
    }

    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error('Ethplorer API key is not defined');
      const { ETHToolbox, getProvider } = await import('@swapkit/toolbox-evm');

      return ETHToolbox({
        api,
        signer: signer as EthereumLedger,
        provider: getProvider(Chain.Ethereum, rpcUrl),
        ethplorerApiKey,
      });
    }
    case Chain.Avalanche: {
      if (!covalentApiKey) throw new Error('Covalent API key is not defined');
      const { AVAXToolbox, getProvider } = await import('@swapkit/toolbox-evm');

      return AVAXToolbox({
        api,
        signer: signer as AvalancheLedger,
        provider: getProvider(Chain.Avalanche, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.BinanceSmartChain: {
      if (!covalentApiKey) throw new Error('Covalent API key is not defined');
      const { BSCToolbox, getProvider } = await import('@swapkit/toolbox-evm');

      return BSCToolbox({
        api,
        signer: signer as BSCLedger,
        provider: getProvider(Chain.BinanceSmartChain, rpcUrl),
        covalentApiKey,
      });
    }
    case Chain.THORChain: {
      const { createStargateClient, getDenomWithChain, ThorchainToolbox } = await import(
        '@swapkit/toolbox-cosmos'
      );
      const toolbox = ThorchainToolbox({ stagenet: false });

      // ANCHOR (@Chillios): Same parts in methods + can extract StargateClient init to toolbox
      const deposit = async ({ assetValue, memo }: DepositParam) => {
        const account = await toolbox.getAccount(address);
        if (!assetValue) throw new Error('invalid asset to deposit');
        if (!account) throw new Error('invalid account');
        if (!(signer as THORChainLedger).pubkey) throw new Error('Account pubkey not found');

        const unsignedMsgs = recursivelyOrderKeys([
          {
            type: 'thorchain/MsgDeposit',
            value: {
              memo,
              signer: address,
              coins: [
                {
                  amount: assetValue.getBaseValue('string'),
                  asset: getDenomWithChain(assetValue),
                },
              ],
            },
          },
        ]);
        const fee = { amount: [], gas: THORCHAIN_DEPOSIT_GAS_FEE };
        const sequence = account.sequence?.toString() || '0';

        const minifiedTx = stringifyKeysInOrder({
          account_number: account.accountNumber.toString(),
          chain_id: ChainId.THORChain,
          fee,
          memo,
          msgs: unsignedMsgs,
          sequence,
        });

        const signatures = await (signer as THORChainLedger).signTransaction(minifiedTx, sequence);

        if (!signatures) throw new Error('tx signing failed');

        const aminoTypes = await toolbox.createDefaultAminoTypes();
        const registry = await toolbox.createDefaultRegistry();
        const signedTxBody: TxBodyEncodeObject = {
          typeUrl: '/cosmos.tx.v1beta1.TxBody',
          value: {
            messages: [
              aminoTypes.fromAmino(toolbox.createDepositMessage(assetValue, address, memo, true)),
            ],
            memo,
          },
        };

        const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;

        const signedTxBodyBytes = registry.encode(signedTxBody);
        const signedGasLimit = Int53.fromString(fee.gas).toNumber();
        const pubkey = encodePubkey({
          type: 'tendermint/PubKeySecp256k1',
          value: (signer as THORChainLedger).pubkey!,
        });
        const signedAuthInfoBytes = makeAuthInfoBytes(
          [{ pubkey, sequence: Number(sequence) }],
          fee.amount,
          signedGasLimit,
          undefined,
          undefined,
          signMode,
        );

        const txRaw = TxRaw.fromPartial({
          bodyBytes: signedTxBodyBytes,
          authInfoBytes: signedAuthInfoBytes,
          signatures: [fromBase64(signatures[0].signature)],
        });

        const txBytes = TxRaw.encode(txRaw).finish();

        const broadcaster = await createStargateClient(
          stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
        );
        const result = await broadcaster.broadcastTx(txBytes);
        return result.transactionHash;
      };

      // ANCHOR (@Chillios): Same parts in methods + can extract StargateClient init to toolbox
      const transfer = async ({ memo = '', assetValue, recipient }: TransferParams) => {
        const account = await toolbox.getAccount(address);
        if (!account) throw new Error('invalid account');
        if (!assetValue) throw new Error('invalid asset');
        if (!account.pubkey) throw new Error('Account pubkey not found');
        if (!(signer as THORChainLedger).pubkey) throw new Error('Account pubkey not found');

        const { accountNumber, sequence = '0' } = account;

        const sendCoinsMessage = {
          amount: [
            { amount: assetValue.getBaseValue('string'), denom: assetValue?.symbol.toLowerCase() },
          ],
          from_address: address,
          to_address: recipient,
        };

        const msg = {
          type: 'thorchain/MsgSend',
          value: sendCoinsMessage,
        };

        const fee = {
          amount: [],
          gas: THORCHAIN_SEND_GAS_FEE,
        };

        // get tx signing msg
        const rawSendTx = stringifyKeysInOrder({
          account_number: accountNumber?.toString(),
          chain_id: ChainId.THORChain,
          fee,
          memo,
          msgs: [msg],
          sequence: sequence?.toString(),
        });

        const signatures = await (signer as THORChainLedger).signTransaction(
          rawSendTx,
          sequence?.toString(),
        );
        if (!signatures) throw new Error('tx signing failed');

        const txObj = {
          msg: [msg],
          fee,
          memo,
          signatures,
        };

        const aminoTypes = await toolbox.createDefaultAminoTypes();
        const registry = await toolbox.createDefaultRegistry();
        const signedTxBody: TxBodyEncodeObject = {
          typeUrl: '/cosmos.tx.v1beta1.TxBody',
          value: {
            messages: txObj.msg.map((msg) => aminoTypes.fromAmino(msg)),
            memo,
          },
        };

        const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;

        const signedTxBodyBytes = registry.encode(signedTxBody);
        const signedGasLimit = Int53.fromString(fee.gas).toNumber();
        const pubkey = encodePubkey({
          type: 'tendermint/PubKeySecp256k1',
          value: (signer as THORChainLedger).pubkey!,
        });
        const signedAuthInfoBytes = makeAuthInfoBytes(
          [{ pubkey, sequence: Number(sequence) }],
          fee.amount,
          signedGasLimit,
          undefined,
          undefined,
          signMode,
        );

        const txRaw = TxRaw.fromPartial({
          bodyBytes: signedTxBodyBytes,
          authInfoBytes: signedAuthInfoBytes,
          signatures: [fromBase64(signatures[0].signature)],
        });

        const txBytes = TxRaw.encode(txRaw).finish();

        const broadcaster = await createStargateClient(
          stagenet ? RPCUrl.THORChainStagenet : RPCUrl.THORChain,
        );
        const result = await broadcaster.broadcastTx(txBytes);
        return result.transactionHash;
      };

      return { ...toolbox, deposit, transfer };
    }

    default:
      throw new Error('Unsupported chain');
  }
};

const connectLedger =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, utxoApiKey, stagenet },
    apis,
    rpcUrls,
  }: ConnectWalletParams) =>
  async (chain: (typeof LEDGER_SUPPORTED_CHAINS)[number], derivationPath?: DerivationPathArray) => {
    const ledgerClient = await getLedgerClient({ chain, derivationPath });
    if (!ledgerClient) return;

    const address = await getLedgerAddress({ chain, ledgerClient });
    const toolbox = await getToolbox({
      address,
      api: apis[chain as Chain.Avalanche],
      chain,
      covalentApiKey,
      derivationPath,
      ethplorerApiKey,
      rpcUrl: rpcUrls[chain],
      signer: ledgerClient,
      blockchairApiKey: blockchairApiKey || utxoApiKey,
      stagenet,
    });

    addChain({
      chain,
      walletMethods: { ...toolbox, getAddress: () => address },
      wallet: { address, balance: [], walletType: WalletOption.LEDGER },
    });

    return true;
  };

export const ledgerWallet = {
  connectMethodName: 'connectLedger' as const,
  connect: connectLedger,
};

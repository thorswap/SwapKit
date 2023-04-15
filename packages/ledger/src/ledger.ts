import { cosmosclient, proto, rest } from '@cosmos-client/core';
import {
  BinanceToolbox,
  DepositParam,
  GaiaToolbox,
  getDenom,
  getDenomWithChain,
  ThorchainToolbox,
} from '@thorswap-lib/toolbox-cosmos';
import { AVAXToolbox, ETHToolbox, getProvider } from '@thorswap-lib/toolbox-evm';
import {
  BCHToolbox,
  BTCToolbox,
  DOGEToolbox,
  LTCToolbox,
  UTXOBuildTxParams,
} from '@thorswap-lib/toolbox-utxo';
import {
  Chain,
  ChainId,
  DerivationPathArray,
  TxParams,
  WalletOption,
  WalletTxParams,
} from '@thorswap-lib/types';
import { auth, StdTx } from 'cosmos-client/x/auth/index.js';
import Long from 'long';
import secp256k1 from 'secp256k1';
import sortKeys from 'sort-keys';

import { AvalancheLedger } from './clients/avalanche.js';
import { getPublicKey } from './clients/binance/helpers.js';
import { BinanceLedger } from './clients/binance/index.js';
import { BitcoinLedger } from './clients/bitcoin.js';
import { BitcoinCashLedger } from './clients/bitcoincash.js';
import { CosmosLedger } from './clients/cosmos.js';
import { DogecoinLedger } from './clients/dogecoin.js';
import { EthereumLedger } from './clients/ethereum.js';
import { LitecoinLedger } from './clients/litecoin.js';
import { THORChainLedger } from './clients/thorchain/index.js';
import { AminoMsgSend, AminoTypes, Coin } from './cosmosTypes.js';
import { getLedgerAddress, getLedgerClient, LEDGER_SUPPORTED_CHAINS } from './helpers/index.js';

type LedgerConfig = {
  covalentApiKey?: string;
  ethplorerApiKey?: string;
  utxoApiKey?: string;
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
  address,
  chain,
  covalentApiKey,
  ethplorerApiKey,
  utxoApiKey,
  signer,
  derivationPath,
}: LedgerConfig & {
  address: string;
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  signer:
    | AvalancheLedger
    | BinanceLedger
    | BitcoinLedger
    | BitcoinCashLedger
    | DogecoinLedger
    | EthereumLedger
    | LitecoinLedger
    | THORChainLedger
    | CosmosLedger;
  derivationPath?: DerivationPathArray;
}) => {
  switch (chain) {
    case Chain.Bitcoin: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      const toolbox = BTCToolbox(utxoApiKey);

      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = params.feeRate || (await toolbox.getSuggestedFeeRate());
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          sender: address,
          feeRate,
          fetchTxHex: true,
        });
        const txHex = await (signer as BitcoinLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx({ txHex });
      };
      return { ...toolbox, transfer };
    }
    case Chain.BitcoinCash: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');

      const toolbox = BCHToolbox(utxoApiKey);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = await toolbox.getSuggestedFeeRate();
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });

        const txHex = await (signer as BitcoinCashLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx({ txHex });
      };
      return { ...toolbox, transfer };
    }
    case Chain.Doge: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');

      const toolbox = DOGEToolbox(utxoApiKey);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = await toolbox.getSuggestedFeeRate();
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as DogecoinLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx({ txHex });
      };
      return { ...toolbox, transfer };
    }
    case Chain.Litecoin: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');

      const toolbox = LTCToolbox(utxoApiKey);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = await toolbox.getSuggestedFeeRate();
        const { psbt, inputs } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as LitecoinLedger).signTransaction(psbt, inputs);

        return toolbox.broadcastTx({ txHex });
      };
      return { ...toolbox, transfer };
    }
    case Chain.Binance: {
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

        const pubKey = getPublicKey(pubKeyResponse!.pk!.toString('hex'));
        const signedTx = transaction.addSignature(pubKey, signResponse!.signature);

        const res = await toolbox.sendRawTransaction(signedTx.serialize(), true);

        return res[0]?.hash;
      };
      return { ...toolbox, transfer };
    }
    case Chain.Cosmos: {
      const toolbox = GaiaToolbox();

      const protoFee = (denom: string, amount: string) =>
        new proto.cosmos.tx.v1beta1.Fee({
          amount: [
            {
              denom,
              amount,
            },
          ],
          gas_limit: Long.fromString('200000'),
        });

      const aminoTypes = new AminoTypes({
        // `AminoConverter` for `MsgSend` needed only as we don't handle other Msg here
        '/cosmos.bank.v1beta1.MsgSend': {
          aminoType: 'cosmos-sdk/MsgSend',
          toAmino: ({
            from_address,
            to_address,
            amount,
          }: proto.cosmos.bank.v1beta1.MsgSend): AminoMsgSend['value'] => ({
            from_address,
            to_address,
            amount:
              // Transform `cosmos.base.v1beta1.ICoin[]` -> `Coin[]` by ignoring all undefined|null denoms & amounts
              amount.reduce<Coin[]>(
                (acc, { denom, amount }) =>
                  !!denom && !!amount ? [...acc, { denom, amount }] : acc,
                [],
              ),
          }),
          //  not needed
          fromAmino: () => {},
        },
      });
      const transfer = async ({ asset, amount, recipient, memo }: TxParams) => {
        if (!asset) throw new Error('invalid asset');
        const denom = getDenom(asset);
        const sendMsg = toolbox.protoMsgSend({ from: address, to: recipient, amount, denom });

        const { sequence, account_number } = await toolbox.getAccount(address);
        if (!account_number || !sequence) throw new Error('Account does not exist');

        // Transform `MsgSend` (proto) -> `MsgSend` (amino)
        const sendMsgAmino = aminoTypes.toAmino({
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: sendMsg,
        });

        const fees = await toolbox.getFees();
        const fee = protoFee(denom, fees.fast.amount().toString());
        // Note: `Msg` to sign needs to be in Amino format due Ledger limitation - currently no Ledger support for proto
        // Note2: Keys need to be sorted for Ledger
        const msgToSign = JSON.stringify(
          sortKeys(
            {
              chain_id: ChainId.Cosmos,
              // Transform JSON of `Fee` (proto) to JSON of `Fee` (amino)
              fee: {
                amount: fee.amount,
                gas: fee.gas_limit.toString(),
              },
              memo: memo || '',
              msgs: [sendMsgAmino],
              sequence: sequence?.toString() || Long.ZERO.toString(),
              account_number: account_number.toString(),
            },
            { deep: true },
          ),
        );
        const sigResult = await signer.ledgerApp.sign(signer.derivationPath, msgToSign);

        const txBody = toolbox.protoTxBody({
          from: address,
          to: recipient,
          amount,
          denom,
          memo: memo || '',
        });

        const { publicKey } = await signer.ledgerApp.getAddress(
          signer.derivationPath,
          signer.chain,
        );

        const secPubKey = new proto.cosmos.crypto.secp256k1.PubKey();
        secPubKey.key = new Uint8Array(Buffer.from(publicKey, 'hex'));

        const authInfo = toolbox.protoAuthInfo({
          pubKey: secPubKey,
          sequence,
          fee,
          mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
        });

        const secpSignature = secp256k1.signatureImport(new Uint8Array(sigResult.signature));

        const txBuilder = new cosmosclient.TxBuilder(toolbox.sdk, txBody, authInfo);
        txBuilder.addSignature(secpSignature);

        const res = await rest.tx.broadcastTx(toolbox.sdk, {
          tx_bytes: txBuilder.txBytes(),
          mode: rest.tx.BroadcastTxMode.Sync,
        });

        if (res?.data?.tx_response?.code !== 0) {
          throw new Error(`Broadcasting tx failed: ${res?.data?.tx_response?.raw_log}`);
        }

        if (!res.data?.tx_response?.txhash) {
          throw new Error(
            `Missing tx hash - broadcasting tx failed: ${res?.data?.tx_response?.raw_log}`,
          );
        }

        return res.data.tx_response.txhash;
      };

      return { ...toolbox, transfer };
    }

    case Chain.Ethereum: {
      if (!ethplorerApiKey) throw new Error('Ethplorer API key is not defined');

      return ETHToolbox({
        signer: signer as EthereumLedger,
        provider: getProvider(Chain.Ethereum),
        ethplorerApiKey,
      });
    }
    case Chain.Avalanche: {
      if (!covalentApiKey) throw new Error('Covalent API key is not defined');

      return AVAXToolbox({
        signer: signer as AvalancheLedger,
        provider: getProvider(Chain.Avalanche),
        covalentApiKey,
      });
    }
    case Chain.THORChain: {
      const toolbox = ThorchainToolbox({ stagenet: false });

      const deposit = async ({ asset, amount, memo }: DepositParam) => {
        const account = await toolbox.getAccount(address);
        if (!asset) throw new Error('invalid asset to deposit');
        if (!account) throw new Error('invalid account');

        const unsignedMsgs = recursivelyOrderKeys([
          {
            type: 'thorchain/MsgDeposit',
            value: {
              coins: [
                {
                  amount: amount.amount().toString(),
                  asset: getDenomWithChain(asset).toUpperCase(),
                },
              ],
              memo,
              signer: address,
            },
          },
        ]);
        const fee = { amount: [], gas: THORCHAIN_DEPOSIT_GAS_FEE };
        const sequence = account.sequence?.toString() || '0';

        const minifiedTx = stringifyKeysInOrder({
          account_number: account.account_number?.toString(),
          chain_id: ChainId.Thorchain,
          fee,
          memo: '',
          msgs: unsignedMsgs,
          sequence,
        });

        const signatures = await (signer as THORChainLedger).signTransaction(minifiedTx, sequence);

        if (!signatures) throw new Error('tx signing failed');

        const { data }: any = await auth.txsPost(
          toolbox.sdk,
          StdTx.fromJSON({ msg: unsignedMsgs, fee, memo: '', signatures }),
          'sync',
        );

        if (!data.logs) throw new Error(`Transaction Failed: ${data.logs}`);

        // return tx hash
        return data?.txhash || '';
      };

      const transfer = async ({ memo = '', amount, asset, recipient }: WalletTxParams) => {
        const account = await toolbox.getAccount(address);
        if (!account) throw new Error('invalid account');
        if (!asset) throw new Error('invalid asset');

        const { account_number: accountNumber, sequence = '0' } = account;

        const sendCoinsMessage = {
          amount: [{ amount: amount.amount().toString(), denom: asset?.symbol.toLowerCase() }],
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
          account_number: accountNumber.toString(),
          chain_id: ChainId.Thorchain,
          fee,
          memo,
          msgs: [msg],
          sequence: sequence.toString(),
        });

        const signatures = await (signer as THORChainLedger).signTransaction(
          rawSendTx,
          sequence.toString(),
        );
        if (!signatures) throw new Error('tx signing failed');

        const txObj = {
          msg: [msg],
          fee,
          memo,
          signatures,
        };

        const stdTx = StdTx.fromJSON(txObj);

        // broadcast tx
        const { data }: any = await auth.txsPost(toolbox.sdk, stdTx, 'sync');

        if (!data.logs) throw new Error(`Transaction Failed: ${data.logs}`);

        // return tx hash
        return data?.txhash || '';
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
    config: { covalentApiKey, ethplorerApiKey, utxoApiKey },
  }: {
    addChain: any;
    config: LedgerConfig;
  }) =>
  async (chain: (typeof LEDGER_SUPPORTED_CHAINS)[number], derivationPath?: DerivationPathArray) => {
    const ledgerClient = getLedgerClient({ chain, derivationPath });
    if (!ledgerClient) return;

    const address = await getLedgerAddress({ chain, ledgerClient });
    const toolbox = await getToolbox({
      address,
      chain,
      utxoApiKey,
      ethplorerApiKey,
      covalentApiKey,
      signer: ledgerClient,
      derivationPath,
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
  isDetected: () => true,
};

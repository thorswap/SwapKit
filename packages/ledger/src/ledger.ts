import * as crypto from '@binance-chain/javascript-sdk/lib/crypto';
import { GasPrice, SigningStargateClient } from '@cosmjs/stargate';
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
  RPCUrl,
  TxParams,
  WalletOption,
  WalletTxParams,
} from '@thorswap-lib/types';
import { auth, StdTx } from 'cosmos-client/x/auth/index.js';

import { AvalancheLedger } from './clients/avalanche.js';
import { BinanceLedger } from './clients/binance.js';
import { BitcoinLedger } from './clients/bitcoin.js';
import { BitcoinCashLedger } from './clients/bitcoincash.js';
import { CosmosLedger } from './clients/cosmos/index.js';
import { DogecoinLedger } from './clients/dogecoin.js';
import { EthereumLedger } from './clients/ethereum.js';
import { LitecoinLedger } from './clients/litecoin.js';
import { THORChainLedger } from './clients/thorchain/index.js';
import { LEDGER_SUPPORTED_CHAINS } from './constants.js';
import { getLedgerAddress, getLedgerClient } from './helpers/index.js';

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
    | THORChainLedger;
  derivationPath?: DerivationPathArray;
}) => {
  switch (chain) {
    case Chain.Bitcoin: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');
      const toolbox = BTCToolbox(utxoApiKey);

      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = params.feeRate || (await toolbox.getSuggestedFeeRate());
        const { psbt, utxos } = await toolbox.buildTx({
          ...params,
          sender: address,
          feeRate,
          fetchTxHex: true,
        });
        const txHex = await (signer as BitcoinLedger).signTransaction(psbt, utxos);

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
        const { psbt, utxos } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as DogecoinLedger).signTransaction(psbt, utxos);

        return toolbox.broadcastTx({ txHex });
      };
      return { ...toolbox, transfer };
    }
    case Chain.Litecoin: {
      if (!utxoApiKey) throw new Error('UTXO API key is not defined');

      const toolbox = LTCToolbox(utxoApiKey);
      const transfer = async (params: UTXOBuildTxParams) => {
        const feeRate = await toolbox.getSuggestedFeeRate();
        const { psbt, utxos } = await toolbox.buildTx({
          ...params,
          feeRate,
          memo: reduceMemo(params.memo),
          sender: address,
          fetchTxHex: true,
        });
        const txHex = await (signer as LitecoinLedger).signTransaction(psbt, utxos);

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

        const pubKey = crypto.getPublicKey(pubKeyResponse!.pk!.toString('hex'));
        const signedTx = transaction.addSignature(pubKey, signResponse!.signature);

        const res = await toolbox.sendRawTransaction(signedTx.serialize(), true);

        return res[0]?.hash;
      };
      return { ...toolbox, transfer };
    }
    case Chain.Cosmos: {
      const toolbox = GaiaToolbox();
      const transfer = async ({ asset, amount, recipient, memo }: TxParams) => {
        const from = address;
        if (!asset) throw new Error('invalid asset');
        // TODO - create fallback for gas price estimation if internal api has error
        const gasPrice = '0.007uatom';

        const sendCoinsMessage = {
          amount: [
            {
              amount: amount.amount().toString(),
              denom: getDenom(asset),
            },
          ],
          fromAddress: from,
          toAddress: recipient,
        };

        const msg = {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: sendCoinsMessage,
        };

        const signingClient = await SigningStargateClient.connectWithSigner(
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
      const account = await toolbox.getAccount(address);
      const accAddress = toolbox.getAccAddress(address);

      const deposit = async ({ asset, amount, memo }: DepositParam) => {
        if (!asset) throw new Error('invalid asset to deposit');
        if (!accAddress) throw new Error('invalid account');
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
        if (!asset) throw new Error('invalid asset');
        if (!account) throw new Error('invalid account');

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

import { assetAmount, assetFromString, assetToBase } from '@thorswap-lib/helpers';
import { AssetEntity } from '@thorswap-lib/swapkit-entities';
import { Tx, TxType } from '@thorswap-lib/types';

import { DexFees, Fee, TransferFee, Tx as BinanceTx, TxType as BinanceTxType } from './types.js';

/**
 * Get TxType
 *
 * @param {BinanceTxType} t
 * @returns {TxType} `transfer` or `unknown`.
 */
export const getTxType = (t: BinanceTxType): TxType => {
  if (t === 'TRANSFER' || t === 'DEPOSIT') return TxType.Transfer;
  return TxType.Unknown;
};

/**
 * Parse Tx
 *
 * @param {BinanceTx} t The transaction to be parsed. (optional)
 * @returns {Tx|null} The transaction parsed from the binance tx.
 */
export const parseTx = (tx: BinanceTx): Tx | null => {
  const asset = assetFromString(`${AssetEntity.BNB().chain}.${tx.txAsset}`);

  if (!asset) return null;

  return {
    asset,
    from: [
      {
        from: tx.fromAddr,
        amount: assetToBase(assetAmount(tx.value, 8)),
      },
    ],
    to: [
      {
        to: tx.toAddr,
        amount: assetToBase(assetAmount(tx.value, 8)),
      },
    ],
    date: new Date(tx.timeStamp),
    type: getTxType(tx.txType),
    hash: tx.txHash,
  };
};

/**
 * Type guard for runtime checks of `Fee`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export const isFee = (v: Fee | TransferFee | DexFees): v is Fee =>
  !!(v as Fee)?.msg_type && (v as Fee)?.fee !== undefined && (v as Fee)?.fee_for !== undefined;

/**
 * Type guard for `TransferFee`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export const isTransferFee = (v: Fee | TransferFee | DexFees): v is TransferFee =>
  isFee((v as TransferFee)?.fixed_fee_params) && !!(v as TransferFee)?.multi_transfer_fee;

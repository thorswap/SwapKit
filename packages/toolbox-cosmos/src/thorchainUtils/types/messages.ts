import { cosmosclient, proto } from '@cosmos-client/core';
import { AminoWrapping, Asset, Chain } from '@thorswap-lib/types';

export type MsgCoin = {
  asset: Asset | string;
  amount: string;
};

export class MsgNativeTx {
  coins: MsgCoin[];
  memo: string;
  signer: cosmosclient.AccAddress;

  constructor(coins: MsgCoin[], memo: string, signer: cosmosclient.AccAddress) {
    this.coins = coins;
    this.memo = memo;
    this.signer = signer;
  }
}

export type ThorchainDepositResponse = AminoWrapping<{
  msg: AminoWrapping<{
    coins: MsgCoin[];
    memo: string;
    signer: string;
  }>[];
  fee: proto.cosmos.tx.v1beta1.Fee;
  signatures: string[];
  memo: string;
  timeout_height: string;
}>;

export type TxResult = {
  observed_tx: {
    tx: {
      id: string;
      chain: string;
      from_address: string;
      to_address: string;
      coins: {
        asset: string;
        amount: string;
      }[];
      gas: {
        asset: string;
        amount: string;
      }[];
      memo: string;
    };
    status: string;
    signers: string[];
  };
  keysign_metric: {
    tx_id: string;
    node_tss_times: null;
  };
};

export type THORNameResult = {
  entries: THORNameResultEntry[];
  expire: string;
  owner: string;
};

export type THORNameResultEntry = {
  chain: Chain;
  address: string;
};

import { cosmosclient } from '@cosmos-client/core';
import { Asset } from '@thorswap-lib/types';

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

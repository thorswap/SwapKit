import type { AssetValue } from "../modules/assetValue";
import type { Chain } from "./chains";

export enum WalletOption {
  KEYSTORE = "KEYSTORE",
  KEEPKEY = "KEEPKEY",
  XDEFI = "XDEFI",
  METAMASK = "METAMASK",
  COINBASE_WEB = "COINBASE_WEB",
  COINBASE_MOBILE = "COINBASE_MOBILE",
  TREZOR = "TREZOR",
  TRUSTWALLET_WEB = "TRUSTWALLET_WEB",
  LEDGER = "LEDGER",
  KEPLR = "KEPLR",
  OKX = "OKX",
  OKX_MOBILE = "OKX_MOBILE",
  BRAVE = "BRAVE",
  WALLETCONNECT = "WALLETCONNECT",
}

export enum LedgerErrorCode {
  NoError = 0x9000,
  LockedDevice = 0x5515,
  TC_NotFound = 65535,
}

export type ChainWallet = {
  chain: Chain;
  address: string;
  balance: AssetValue[];
  walletType: WalletOption;
};

export type EmptyWallet = { [key in Chain]?: unknown };

export type BaseWallet<T extends EmptyWallet | unknown> = {
  // @ts-expect-error
  [key in Chain]: ChainWallet & T[key];
};

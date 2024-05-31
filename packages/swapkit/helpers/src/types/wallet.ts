import type { Eip1193Provider } from "ethers";
import type { AssetValue } from "../modules/assetValue";
import type { Chain } from "./chains";

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}

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
  EIP6963 = "EIP6963",
  EXODUS = "EXODUS",
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

export type Wallet<T> = BaseWallet<T>;

export type EIP6963ProviderInfo = {
  walletId: string;
  uuid: string;
  name: string;
  icon: string;
};

export type EIP6963ProviderDetail = {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
};

export type EIP6963Provider = {
  info: EIP6963ProviderInfo;
  provider: Eip1193Provider;
};

// This type represents the structure of an event dispatched by a wallet to announce its presence based on EIP-6963.
export type EIP6963AnnounceProviderEvent = Event & {
  detail: EIP6963Provider;
};

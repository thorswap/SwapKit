import type { Eip1193Provider } from "ethers";
import type { AssetValue } from "../modules/assetValue";
import type { Chain } from "./chains";

declare global {
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}

export enum WalletOption {
  BRAVE = "BRAVE",
  COINBASE_MOBILE = "COINBASE_MOBILE",
  COINBASE_WEB = "COINBASE_WEB",
  EIP6963 = "EIP6963",
  EXODUS = "EXODUS",
  KEEPKEY = "KEEPKEY",
  KEPLR = "KEPLR",
  KEYSTORE = "KEYSTORE",
  LEDGER = "LEDGER",
  METAMASK = "METAMASK",
  OKX = "OKX",
  OKX_MOBILE = "OKX_MOBILE",
  PHANTOM = "PHANTOM",
  RADIX_WALLET = "RADIX_WALLET",
  TREZOR = "TREZOR",
  TALISMAN = "TALISMAN",
  TRUSTWALLET_WEB = "TRUSTWALLET_WEB",
  WALLETCONNECT = "WALLETCONNECT",
  XDEFI = "XDEFI",
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
  disconnect?: () => void;
};

export type EmptyWallet = { [key in Chain]?: unknown };
export type BaseWallet<T extends EmptyWallet | Record<string, unknown>> = {
  [key in Chain]: ChainWallet & (T extends EmptyWallet ? T[key] : unknown);
};

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

export enum WalletOption {
  'KEYSTORE' = 'KEYSTORE',
  'XDEFI' = 'XDEFI',
  'METAMASK' = 'METAMASK',
  'COINBASE_WEB' = 'COINBASE_WEB',
  'TREZOR' = 'TREZOR',
  'TRUSTWALLET_WEB' = 'TRUSTWALLET_WEB',
  'LEDGER' = 'LEDGER',
  'KEPLR' = 'KEPLR',
  'OKX' = 'OKX',
  'OKX_MOBILE' = 'OKX_MOBILE',
  'BRAVE' = 'BRAVE',
  'WALLETCONNECT' = 'WALLETCONNECT',
}

export type EVMWalletOptions =
  | WalletOption.BRAVE
  | WalletOption.OKX_MOBILE
  | WalletOption.METAMASK
  | WalletOption.TRUSTWALLET_WEB
  | WalletOption.COINBASE_WEB;

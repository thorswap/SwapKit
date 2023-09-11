import type { SwapKitNumber } from './amount.ts';
import type { Asset } from './asset.ts';

export const MOCK_PHRASE =
  'image rally need wedding health address purse army antenna leopard sea gain';

export enum WalletStatus {
  NotInstalled,
  Detected,
}

export enum FeeOption {
  Average = 'average',
  Fast = 'fast',
  Fastest = 'fastest',
}

export type Balance = {
  asset: Asset;
  amount: SwapKitNumber;
};

export type Fees = Record<FeeOption, SwapKitNumber> & {
  type?: 'base' | 'byte';
};

export type FeeRates = Record<FeeOption, number>;

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
  'BRAVE' = 'BRAVE',
  'WALLETCONNECT' = 'WALLETCONNECT',
}

export type EVMWalletOptions =
  | WalletOption.BRAVE
  | WalletOption.METAMASK
  | WalletOption.TRUSTWALLET_WEB
  | WalletOption.COINBASE_WEB;

export type Keystore = {
  crypto: {
    cipher: string;
    ciphertext: string;
    cipherparams: {
      iv: string;
    };
    kdf: string;
    kdfparams: {
      prf: string;
      dklen: number;
      salt: string;
      c: number;
    };
    mac: string;
  };
  id: string;
  version: number;
  meta: string;
};

export type BaseWalletMethods = {
  getAddress: () => string;
};

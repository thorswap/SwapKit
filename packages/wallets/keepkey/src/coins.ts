/*
    KeepKey Naming conventions and translations

    HDwallet Repository (ref):https://github.com/shapeshift/hdwallet
                -Highlander
 */
export const blockchains = [
  'bitcoin',
  'ethereum',
  'thorchain',
  'bitcoincash',
  'litecoin',
  'binance',
  'cosmos',
  'dogecoin',
  'osmosis',
] as const;
type Blockchain = (typeof blockchains)[number];

const HARDENED = 0x80000000;

export function addressNListToBIP32(address: number[]): string {
  return `m/${address.map((num) => (num >= HARDENED ? `${num - HARDENED}'` : num)).join('/')}`;
}

export function getNativeAssetForBlockchain(blockchain: string) {
  // @ts-ignore
  if (COIN_MAP[blockchain.toLowerCase()]) {
    // @ts-ignore
    return COIN_MAP[blockchain.toLowerCase()];
  } else {
    throw Error(' Unknown blockchain! ' + blockchain);
  }
}

export interface PathEntry {
  note: string;
  blockchain?: Blockchain;
  symbol: string;
  network: string;
  script_type: string;
  available_scripts_types?: string[];
  type: string;
  addressNList: number[];
  addressNListMaster: number[];
  curve: string;
  showDisplay: boolean;
  testnet?: boolean;
}

// TODO: Refactor to be more human readable & taken by object, not 100 if-esle cases
export function getPaths(blockchains?: any, isTestnet?: boolean) {
  let output = [];
  if (!blockchains) blockchains = [];
  if (blockchains.indexOf('bitcoin') >= 0) {
    if (isTestnet) {
      output.push({
        note: 'Bitcoin testnet account 0',
        blockchain: 'bitcoin',
        testnet: true,
        symbol: 'BTC',
        network: 'BTC',
        script_type: 'p2wpkh', //bech32
        available_scripts_types: ['p2pkh', 'p2sh', 'p2wpkh', 'p2sh-p2wpkh'],
        type: 'zpub',
        addressNList: [0x80000000 + 84, 0x80000000 + 1, 0x80000000 + 0],
        addressNListMaster: [0x80000000 + 84, 0x80000000 + 1, 0x80000000 + 0, 0, 0],
        curve: 'secp256k1',
        showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      });
    } else {
      //legacy  bip44
      output.push({
        note: 'Bitcoin account 0',
        blockchain: 'bitcoin',
        symbol: 'BTC',
        network: 'BTC',
        script_type: 'p2pkh',
        available_scripts_types: ['p2pkh', 'p2sh', 'p2wpkh', 'p2sh-p2wpkh'],
        type: 'xpub',
        addressNList: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 0],
        addressNListMaster: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 0, 0, 0],
        curve: 'secp256k1',
        showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      });
      //TODO non-native segwit wraped p2sh

      //bech32 bip84
      output.push({
        note: 'Bitcoin account Native Segwit (Bech32)',
        blockchain: 'bitcoin',
        symbol: 'BTC',
        network: 'BTC',
        script_type: 'p2wpkh', //bech32
        available_scripts_types: ['p2pkh', 'p2sh', 'p2wpkh', 'p2sh-p2wpkh'],
        type: 'zpub',
        addressNList: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 0],
        addressNListMaster: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 0, 0, 0],
        curve: 'secp256k1',
        showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      });
    }
  }

  if (blockchains.indexOf('ethereum') >= 0) {
    let entry: any = {
      note: ' ETH primary (default)',
      symbol: 'ETH',
      network: 'ETH',
      script_type: 'ethereum',
      available_scripts_types: ['ethereum'],
      type: 'address',
      addressNList: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'ethereum',
    };
    if (isTestnet) entry.testnet = true;
    output.push(entry);
  }

  if (blockchains.indexOf('avalanche') >= 0) {
    let entry: any = {
      note: ' AVAX primary (default)',
      symbol: 'AVAX',
      network: 'AVAX',
      script_type: 'avalanche',
      available_scripts_types: ['avalanche'],
      type: 'address',
      addressNList: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 60, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'avalanche',
    };
    if (isTestnet) entry.testnet = true;
    output.push(entry);
  }

  if (blockchains.indexOf('thorchain') >= 0) {
    let entry: any = {
      note: ' Default RUNE path ',
      type: 'address',
      addressNList: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      script_type: 'thorchain',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'thorchain',
      symbol: 'RUNE',
      network: 'RUNE',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('secret') >= 0) {
    let entry: any = {
      note: ' Default Secret path ',
      type: 'address',
      addressNList: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 931, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      script_type: 'thorchain',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'thorchain',
      symbol: 'RUNE',
      network: 'RUNE',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('cosmos') >= 0) {
    let entry: any = {
      note: ' Default ATOM path ',
      type: 'address',
      script_type: 'cosmos',
      available_scripts_types: ['cosmos'],
      addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'cosmos',
      symbol: 'ATOM',
      network: 'ATOM',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('osmosis') >= 0) {
    let entry: any = {
      note: ' Default OSMO path ',
      type: 'address',
      script_type: 'bech32',
      available_scripts_types: ['bech32'],
      addressNList: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 118, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'osmosis',
      symbol: 'OSMO',
      network: 'OSMO',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('binance') >= 0) {
    let entry: any = {
      note: 'Binance default path',
      type: 'address',
      script_type: 'binance',
      available_scripts_types: ['binance'],
      addressNList: [0x80000000 + 44, 0x80000000 + 714, 0x80000000 + 0, 0, 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 714, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'binance',
      symbol: 'BNB',
      network: 'BNB',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('bitcoincash') >= 0) {
    let entry: any = {
      note: 'Bitcoin Cash Default path',
      type: 'xpub',
      script_type: 'p2pkh',
      available_scripts_types: ['p2pkh'],
      addressNList: [0x80000000 + 44, 0x80000000 + 145, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 145, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'bitcoincash',
      symbol: 'BCH',
      network: 'BCH',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('litecoin') >= 0) {
    let entry: any = {
      note: 'Litecoin Default path',
      type: 'xpub',
      script_type: 'p2pkh',
      available_scripts_types: ['p2pkh'],
      addressNList: [0x80000000 + 44, 0x80000000 + 2, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 2, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'litecoin',
      symbol: 'LTC',
      network: 'LTC',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);

    //bech32 bip84
    output.push({
      note: 'Litecoin account Native Segwit (Bech32)',
      blockchain: 'litecoin',
      symbol: 'LTC',
      network: 'LTC',
      script_type: 'p2wpkh', //bech32
      available_scripts_types: ['p2pkh', 'p2sh', 'p2wpkh', 'p2sh-p2wpkh'],
      type: 'zpub',
      addressNList: [0x80000000 + 84, 0x80000000 + 2, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 84, 0x80000000 + 2, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
    });
    output.push(entry);
  }

  if (blockchains.indexOf('dogecoin') >= 0) {
    let entry: any = {
      note: 'Dogecoin Default path',
      type: 'xpub',
      script_type: 'p2pkh',
      available_scripts_types: ['p2pkh'],
      addressNList: [0x80000000 + 44, 0x80000000 + 3, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 3, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      blockchain: 'dogecoin',
      symbol: 'DOGE',
      network: 'DOGE',
    };
    if (isTestnet) {
      entry.testnet = true;
    }
    output.push(entry);
  }

  if (blockchains.indexOf('dash') >= 0) {
    let entry: any = {
      note: 'Default dash path',
      type: 'xpub',
      coin: 'Dash',
      symbol: 'DASH',
      network: 'DASH',
      blockchain: 'dash',
      script_type: 'p2pkh',
      available_scripts_types: ['p2pkh'],
      addressNList: [0x80000000 + 44, 0x80000000 + 5, 0x80000000 + 0],
      addressNListMaster: [0x80000000 + 44, 0x80000000 + 5, 0x80000000 + 0, 0, 0],
      curve: 'secp256k1',
      showDisplay: false, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
    };

    output.push(entry);
  }

  return output;
}

export enum Coin {
  BTC = 'Bitcoin',
  ATOM = 'Cosmos',
  ARB = 'Arbitrum',
  OSMO = 'Osmosis',
  TEST = 'Testnet',
  BCH = 'BitcoinCash',
  LTC = 'Litecoin',
  DASH = 'Dash',
  DGB = 'DigiByte',
  DOGE = 'Dogecoin',
  RUNE = 'Thorchain',
  ETH = 'Ethereum',
  ADA = 'Cardano',
  MATIC = 'Polygon',
  BNB = 'Binance',
  AVAX = 'Avalanche',
  EOS = 'Eos',
  FIO = 'Fio',
}

export interface AddressInfo {
  address_n: number[];
  path: string;
  coin: Coin; // Using enum type here
  script_type: string;
  showDisplay: boolean;
}

export const addressInfoForCoin = (
  symbol: string,
  isTestnet?: boolean,
  scriptType?: string,
  showDisplay?: boolean,
): AddressInfo => {
  if (!isTestnet) isTestnet = false;
  if (!showDisplay) showDisplay = false;
  const paths = getPaths(blockchains);
  //thorswap hack
  if (symbol === 'THOR') symbol = 'RUNE';
  if (symbol === 'GAIA') symbol = 'ATOM';

  // log.info('paths', paths)
  symbol = symbol.toUpperCase();
  const blockchainEntries = paths.filter((entry: any) => entry.symbol === symbol.toUpperCase());
  // log.info('blockchainEntries', blockchainEntries)
  if (!blockchainEntries) {
    throw new Error(`Blockchain symbol '${symbol}' not found.`);
  }
  let entry: any;
  if (scriptType && blockchainEntries.length > 1) {
    //filter path by script type
    entry = blockchainEntries.find((entry: any) => entry.script_type === scriptType);
  } else {
    entry = blockchainEntries[0];
  }
  //validate script type options
  const addressInfo: AddressInfo = {
    address_n: entry.addressNListMaster,
    path: addressNListToBIP32(entry.addressNListMaster),
    coin: Coin[symbol.toUpperCase() as keyof typeof Coin],
    script_type: scriptType || entry.script_type,
    showDisplay: entry.showDisplay,
  };

  return addressInfo;
};

import { Chain } from '@coinmasters/types';
import { addressNListToBIP32, xpubConvert } from '@pioneer-platform/pioneer-coins';

import type { UTXOLedgerClients } from '../types.ts';

import type { getLedgerClient } from './getLedgerClient.ts';
import type { LEDGER_SUPPORTED_CHAINS } from './ledgerSupportedChains.ts';

enum PublicKeyType {
  xpub = '0488b21e',
  ypub = '049d7cb2',
  zpub = '04b24746',
  dgub = '02facafd',
  Ltub = '019da462',
  Mtub = '01b26ef6',
}

export const ChainToXpub = {
  [Chain.Bitcoin]: 76067358,
  [Chain.BitcoinCash]: 76067358,
  [Chain.Dash]: 50221772,
  [Chain.Digibyte]: 76067358,
  [Chain.Litecoin]: 27108450,
  [Chain.Zcash]: 76067358,
};

export const getLedgerPubkeys = async ({
  chain,
  ledgerClient,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  ledgerClient: Awaited<ReturnType<typeof getLedgerClient>>;
}) => {
  if (!ledgerClient) return '';

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dash:
    case Chain.Zcash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      await (ledgerClient as UTXOLedgerClients).connect();
      console.log('ledgerClient: ', ledgerClient);
      console.log('ledgerClient.paths: ', ledgerClient.paths);
      let pubkeys = [];

      for (let i = 0; i < ledgerClient.paths.length; i++) {
        let path = ledgerClient.paths[i];
        console.log('path: ', path);
        let bip32Path = addressNListToBIP32(path.addressNList);
        console.log('bip32Path: ', bip32Path);
        console.log('ChainToXpub[chain]: ', ChainToXpub[chain]);
        let pubkey = await (ledgerClient as UTXOLedgerClients).getExtendedPublicKey(
          bip32Path,
          ChainToXpub[chain],
        );
        console.log('pubkey: ', pubkey);
        if (bip32Path.indexOf('84')) {
          pubkey = xpubConvert(pubkey, 'zpub');
        }
        path.pubkey = pubkey;
        path.xpub = pubkey;
        pubkeys.push(path);
      }
      return pubkeys;
    }
  }
};

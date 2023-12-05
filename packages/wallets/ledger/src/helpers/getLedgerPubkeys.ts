import { Chain } from '@coinmasters/types';

import type { UTXOLedgerClients } from '../types.ts';
import { addressNListToBIP32 } from '@pioneer-platform/pioneer-coins';
import type { getLedgerClient } from './getLedgerClient.ts';
import type { LEDGER_SUPPORTED_CHAINS } from './ledgerSupportedChains.ts';

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
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      await (ledgerClient as UTXOLedgerClients).connect();
      console.log('ledgerClient: ', ledgerClient);
      console.log('ledgerClient.paths: ', ledgerClient.paths);
      let pubkeys = [];
      // eslint-disable-next-line for-direction
      for (let i = 0; i < ledgerClient.paths.length; i++) {
        let path = ledgerClient.paths[i];
        console.log('path: ', path);
        let bip32Path = addressNListToBIP32(path.addressNList)
        const pubkey = await (ledgerClient as UTXOLedgerClients).getExtendedPublicKey(bip32Path);
        console.log('pubkey: ', pubkey);
        path.pubkey = pubkey;
        path.xpub = pubkey;
        pubkeys.push(path);
      }
      return pubkeys;
    }
  }
};

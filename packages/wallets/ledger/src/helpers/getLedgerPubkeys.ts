import { Chain } from '@coinmasters/types';

import type { UTXOLedgerClients } from '../types.ts';

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
        //TODO actually get the pubkey on the path!!!
        const pubkey = await (ledgerClient as UTXOLedgerClients).getExtendedPublicKey();
        console.log('pubkey: ', pubkey);
        path.pubkey = pubkey;
        path.xpub = pubkey;
        pubkeys.push(path);
      }
      return pubkeys;
    }
  }
};

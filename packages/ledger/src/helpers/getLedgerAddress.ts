import { Chain } from '@thorswap-lib/types';

import { CosmosLedgerClients, EVMLedgerClients, UTXOLedgerClients } from '../types.js';

import { getLedgerClient } from './getLedgerClient.js';
import { LEDGER_SUPPORTED_CHAINS } from './ledgerSupportedChains.js';

export const getLedgerAddress = async ({
  chain,
  ledgerClient,
}: {
  chain: (typeof LEDGER_SUPPORTED_CHAINS)[number];
  ledgerClient: ReturnType<typeof getLedgerClient>;
}) => {
  if (!ledgerClient) return '';

  switch (chain) {
    case Chain.Cosmos:
    case Chain.Binance:
    case Chain.THORChain: {
      return (ledgerClient as CosmosLedgerClients).connect();
    }

    case Chain.Ethereum:
    case Chain.Avalanche: {
      return (ledgerClient as EVMLedgerClients).getAddress();
    }

    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Doge:
    case Chain.Litecoin: {
      await (ledgerClient as UTXOLedgerClients).connect();
      const address = await (ledgerClient as UTXOLedgerClients).getAddress();

      return chain === Chain.BitcoinCash ? address.replace('bitcoincash:', '') : address;
    }
  }
};

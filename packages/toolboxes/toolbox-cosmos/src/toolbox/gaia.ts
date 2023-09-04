import type { OfflineDirectSigner } from '@cosmjs/proto-signing';
import type { Account } from '@cosmjs/stargate';
import { baseAmount } from '@thorswap-lib/helpers';
import type { Balance } from '@thorswap-lib/types';
import { ApiUrl, BaseDecimal, ChainId, DerivationPath } from '@thorswap-lib/types';

import { CosmosClient } from '../cosmosClient.ts';
import type { GaiaToolboxType } from '../index.ts';
import type { TransferParams } from '../types.ts';
import { getAsset } from '../util.ts';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.ts';

export const GaiaToolbox = ({ server }: { server?: string } = {}): GaiaToolboxType => {
  const client = new CosmosClient({
    server: server || ApiUrl.Cosmos,
    chainId: ChainId.Cosmos,
  });

  const baseToolbox: {
    validateAddress: (address: string) => Promise<boolean>;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getAccount: (address: string) => Promise<Account | null>;
    getBalance: (address: string) => Promise<Balance[]>;
    transfer: (params: TransferParams) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
    getSignerFromPrivateKey: (privateKey: Uint8Array) => Promise<OfflineDirectSigner>;
    getPubKeyFromMnemonic: (phrase: string) => Promise<string>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    getAsset,
    client,
  });

  return {
    ...baseToolbox,
    getFees: async () => {
      const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;
      return {
        type: 'base',
        fast: baseAmount(baseFee * 1.5, BaseDecimal.GAIA),
        fastest: baseAmount(baseFee * 3, BaseDecimal.GAIA),
        average: baseAmount(baseFee, BaseDecimal.GAIA),
      };
    },
  };
};

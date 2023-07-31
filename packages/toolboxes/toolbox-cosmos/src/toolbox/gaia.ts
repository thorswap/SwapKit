import { OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Account } from '@cosmjs/stargate';
import { baseAmount } from '@thorswap-lib/helpers';
import { Balance, BaseDecimal, ChainId, DerivationPath } from '@thorswap-lib/types';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { GaiaToolboxType } from '../index.js';
import { TransferParams } from '../types.js';
import { getAsset } from '../util.js';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.js';

export const GaiaToolbox = ({ server }: { server?: string } = {}): GaiaToolboxType => {
  const sdk = new CosmosSDKClient({
    server: server || 'https://node-router.thorswap.net/cosmos/rest',
    chainId: ChainId.Cosmos,
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    validateAddress: (address: string) => boolean;
    getAddressFromMnemonic: (phrase: string) => Promise<string>;
    getAccount: (address: string) => Promise<Account | null>;
    getBalance: (address: string) => Promise<Balance[]>;
    transfer: (params: TransferParams) => Promise<string>;
    getSigner: (phrase: string) => Promise<OfflineDirectSigner>;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    getAsset,
    sdk,
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

import { StdFee } from '@cosmjs/amino';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { assetToString, baseAmount } from '@thorswap-lib/helpers';
import { Asset, BaseDecimal, ChainId, DerivationPath, FeeType, RPCUrl } from '@thorswap-lib/types';

import { CosmosSDKClient } from '../cosmosSdkClient.js';
import { GaiaToolboxType } from '../index.js';
import { TransferParams } from '../types.js';
import { getAsset } from '../util.js';

import { BaseCosmosToolbox, getFeeRateFromThorswap } from './BaseCosmosToolbox.js';

const DEFAULT_FEE_MAINNET = {
  amount: [{ denom: 'uatom', amount: '500' }],
  gas: '200000',
};

export const GaiaToolbox = ({ server }: { server?: string } = {}): GaiaToolboxType => {
  const sdk = new CosmosSDKClient({
    server: server || 'https://node-router.thorswap.net/cosmos/rest',
    chainId: ChainId.Cosmos,
  });

  const baseToolbox: {
    sdk: CosmosSDKClient['sdk'];
    validateAddress: (address: string) => boolean;
    getAddressFromMnemonic: (phrase: string) => string;
  } = BaseCosmosToolbox({
    decimal: BaseDecimal.GAIA,
    derivationPath: DerivationPath.GAIA,
    getAsset,
    sdk,
  });

  return {
    ...baseToolbox,

    getAccount: async (address: string) => {
      const client = await StargateClient.connect(RPCUrl.Cosmos);
      return client.getAccount(address);
    },
    getBalance: async (address: string, filterAssets?: Asset[]) => {
      const client = await StargateClient.connect(RPCUrl.Cosmos);
      const balances = await client.getAllBalances(address);
      return balances
        .filter(({ denom }) => denom && getAsset(denom))
        .map(({ denom, amount }) => ({
          asset: getAsset(denom) as Asset,
          amount: baseAmount(amount, BaseDecimal.GAIA),
        }))
        .filter(
          ({ asset }) =>
            !filterAssets ||
            filterAssets.filter(
              (filteredAsset) => assetToString(asset) === assetToString(filteredAsset),
            ).length,
        );
    },
    getSigner: async (phrase: string) => {
      return DirectSecp256k1HdWallet.fromMnemonic(phrase, { prefix: sdk.prefix });
    },
    transfer: async ({
      amount,
      asset,
      from,
      to,
      fee = DEFAULT_FEE_MAINNET,
      memo = '',
      signer,
    }: TransferParams) => {
      if (!signer) {
        throw new Error('Signer not defined');
      }

      const signingClient = await SigningStargateClient.connectWithSigner(RPCUrl.Cosmos, signer);

      const txResponse = await signingClient.sendTokens(
        from,
        to,
        [{ denom: asset, amount }],
        fee as StdFee,
        memo,
      );

      return txResponse.transactionHash;
    },
    getFees: async () => {
      const baseFee = (await getFeeRateFromThorswap(ChainId.Cosmos)) || 500;
      return {
        type: FeeType.FlatFee,
        fast: baseAmount(baseFee * 1.5, BaseDecimal.GAIA),
        fastest: baseAmount(baseFee * 3, BaseDecimal.GAIA),
        average: baseAmount(baseFee, BaseDecimal.GAIA),
      };
    },
  };
};

import { assetToString } from '@thorswap-lib/helpers';
import { Asset } from '@thorswap-lib/types';

import { AssetAtom, AssetMuon } from './types.js';

/**
 * Get denomination from Asset
 *
 * @param {Asset} asset
 * @returns {string} The denomination of the given asset.
 */
export const getDenom = (asset: Asset): string => {
  if (assetToString(asset) === assetToString(AssetAtom)) return 'uatom';
  if (assetToString(asset) === assetToString(AssetMuon)) return 'umuon';
  return asset.symbol;
};

/**
 * Get Asset from denomination
 *
 * @param {string} denom
 * @returns {Asset|null} The asset of the given denomination.
 */
export const getAsset = (denom: string): Asset | null => {
  if (denom === getDenom(AssetAtom)) return AssetAtom;
  if (denom === getDenom(AssetMuon)) return AssetMuon;
  return null;
};

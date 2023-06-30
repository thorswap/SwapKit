import { ERROR_CODE } from './types.js';

export const ERROR_DISPLAY_MESSAGES: Record<string, string> = {
  [ERROR_CODE.INVALID_INPUT_PARAMETERS]: 'Invalid input parameters: {0}.',
  [ERROR_CODE.UNKNOWN_PROVIDERS]: 'Unknown providers: {0}.',
  [ERROR_CODE.CANNOT_FIND_INBOUND_ADDRESS]: 'Cannot find inbound address.',
  [ERROR_CODE.NO_INBOUND_ADDRESSES]: 'No inbound addresses.',
  [ERROR_CODE.CHAIN_HALTED_OR_UNSUPPORTED]: 'Chain {0} halted or unsupported.',
  [ERROR_CODE.MISSING_INPUT_PARAMETER]: 'Missing input parameter: {0}.',
  [ERROR_CODE.INVALID_TYPE_GENERIC]: 'Invalid type',
  [ERROR_CODE.INVALID_NUMBER_STRING]: 'Invalid number string.',
  [ERROR_CODE.INVALID_NUMBER]: 'Invalid number.',
  [ERROR_CODE.INVALID_BOOLEAN]: 'Invalid boolean.',
  [ERROR_CODE.INVALID_OBJECT]: 'Invalid object.',
  [ERROR_CODE.INVALID_ARRAY]: 'Invalid array.',
  [ERROR_CODE.SELL_AMOUNT_MUST_BE_POSITIVE_INTEGER]: 'Sell amount must be a positive integer.',
  [ERROR_CODE.SELL_BUY_ASSETS_ARE_THE_SAME]: 'Sell and buy assets are the same.',
  [ERROR_CODE.MISSING_SOURCE_ADDRESS_FOR_SYNTH]: 'Source address is required for synth quote.',
  [ERROR_CODE.AFF_ADDRESS_AND_BPS_OR_NEITHER]:
    'Must provide affiliateAddress and affiliateBasisPoints params, or neither.',
  [ERROR_CODE.AFF_ADDRESS_TOO_LONG]: 'affiliateAddress too long: 3 characters max.',
  [ERROR_CODE.AFF_BPS_INTEGER_0_100]: 'affiliateBasisPoints must be an integer between 0 and 100.',
  [ERROR_CODE.SOURCE_ADDRESS_INVALID_FOR_SELL_CHAIN]: 'Source address {0} invalid for sell chain.',
  [ERROR_CODE.DESTINATION_ADDRESS_INVALID_FOR_BUY_CHAIN]:
    'Destination address {0} invalid for buy chain.',
  [ERROR_CODE.PREFERRED_PROFVIDER_NOT_SUPPORTED]: 'Preferred provider not supported.',
  [ERROR_CODE.DESTINATION_ADDRESS_SMART_CONTRACT]: 'Destination address is a smart contract.',
  [ERROR_CODE.BUY_AMOUNT_MUST_BE_POSITIVE_INTEGER]: 'Buy amount must be a positive integer.',
  [ERROR_CODE.INVALID_PROVIDER]: 'Invalid provider {0}.',
  [ERROR_CODE.MISSING_CROSS_CHAIN_PROVIDER]: 'Missing cross-chain provider.',
  [ERROR_CODE.MISSING_AVAX_PROVIDER]: 'Missing AVAX provider.',
  [ERROR_CODE.MISSING_BSC_PROVIDER]: 'Missing BSC provider.',
  [ERROR_CODE.MISSING_ETH_PROVIDER]: 'Missing ETH provider.',
  [ERROR_CODE.INVALID_PROVIDER_FOR_SWAP_OUT]: 'Invalid provider for swap out.',
  [ERROR_CODE.INVALID_CHAIN]: 'Invalid chain {0}.',
  [ERROR_CODE.INVALID_ASSET]: 'Invalid asset {0}.',
  [ERROR_CODE.UNSUPPORTED_CHAIN]: 'Unsupported chain {0}.',
  [ERROR_CODE.UNSUPPORTED_ASSET]: 'Unsupported asset {0}.',
  [ERROR_CODE.UNSUPPORTED_ASSET_FOR_SWAPOUT]: 'Unsupported asset {0} for swap out.',
  [ERROR_CODE.THORNODE_QUOTE_GENERIC_ERROR]: 'ThorNode quote generic error.',
  [ERROR_CODE.NOT_ENOUGH_SYNTH_BALANCE]:
    "Source address doesn't have enough synth balance for this quote.",
  [ERROR_CODE.SYNTH_MINTING_CAP_REACHED]: 'Synth minting cap reached.',
  [ERROR_CODE.INVALID_QUOTE_MODE]: 'Invalid quote mode.',
  [ERROR_CODE.NO_QUOTES]: 'No quotes to service this request.',
  [ERROR_CODE.SERVICE_UNAVAILABLE_GENERIC]: 'Service unavailable.',
  [ERROR_CODE.MISSING_GAS_DATA_GENERIC]: 'Missing gas data.',
  [ERROR_CODE.MISSING_TOKEN_INFO_GENERIC]: 'Missing token info.',
  [ERROR_CODE.CANT_FIND_TOKEN_LIST]: "Can't find tokenlist {0}.",
  [ERROR_CODE.NO_PRICE]: 'No price for asset {0}.',
  [ERROR_CODE.PRICE_IS_STALE]: 'Price is stale for asset {0}.',
  [ERROR_CODE.ADDRESS_NOT_WHITELISTED]: 'Address {0} not whitelisted for airdrop.',
  [ERROR_CODE.ADDRESS_ALREADY_CLAIMED]: 'Address {0} already claimed the airdrop.',
};

export const getDisplayMessage = (code: ERROR_CODE, displayMessageParams: string[]) => {
  let displayMessage = ERROR_DISPLAY_MESSAGES[code];

  for (let i = 0; i < displayMessageParams.length; i++) {
    displayMessage = displayMessage.replace(`{${i}}`, displayMessageParams[i]);
  }

  if (displayMessageParams.length === 0) return displayMessage.replace('{0}', '');
  else return displayMessage;
};

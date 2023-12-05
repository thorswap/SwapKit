export const NAVIGATION_SCREENS = {
  WELCOME_SCREEN: 'WelcomeScreen',
  SWAPKIT_MENU: 'SwapkitMenu',

  CONFIG_EDIT: 'ConfigEdit',
  CONFIG_INIT: 'ConfigInit',

  CONNECT_KEYSTORE: 'ConnectKeystore',

  SWAP: 'Swap',
  CHECK_BALANCE: 'CheckBalance',

  EXIT: 'Exit',
} as const;

export type NavigationScreens = (typeof NAVIGATION_SCREENS)[keyof typeof NAVIGATION_SCREENS];

export type SelectNavigatonParams = {
  label: string;
  value: NavigationScreens;
};

export const CONFIG_EDIT_ITEMS = {
  COVALENT_API_KEY: 'covalentApiKey',
  ETHPLORER_API_KEY: 'ethplorerApiKey',
  UTXO_API_KEY: 'utxoApiKey',
  STAGENET: 'stagenet',

  FINISH: 'finish',
} as const;

export type ConfigEditItems = (typeof CONFIG_EDIT_ITEMS)[keyof typeof CONFIG_EDIT_ITEMS];

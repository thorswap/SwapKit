export enum NavigationScreens {
  WELCOME_SCREEN = 'WelcomeScreen',
  SWAPKIT_MENU = 'SwapkitMenu',

  CONFIG_EDIT = 'ConfigEdit',
  CONFIG_INIT = 'ConfigInit',

  CONNECT_KEYSTORE = 'ConnectKeystore',

  SWAP = 'Swap',
  CHECK_BALANCE = 'CheckBalance',

  EXIT = 'Exit',
}

export type NavigationParams = `${NavigationScreens}`;

export type SelectNavigatonParams = {
  label: string;
  value: NavigationParams;
};

export enum ConfigEditItems {
  COVALENT_API_KEY,
  ETHPLORER_API_KEY,
  UTXO_API_KEY,
  WALLET_CONNECT_PROJECT_ID,
  TREZOR_CREDENTIALS,
  STAGENET,

  FINISH,
}

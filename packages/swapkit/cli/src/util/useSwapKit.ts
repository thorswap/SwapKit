import type { SwapKitCore as SKC } from '@coinmasters/core';
import { keystoreWallet } from '@coinmasters/wallet-keystore';
import { createContext, useState } from 'react';

import type { Config } from './useConfig.js';
const { SwapKitCore } = await import('@coinmasters/core');

export const SwapKitContext = createContext<{
  swapkit: SKC;
  keystoreConnected: boolean;
  setKeystoreConnected: (connected: boolean) => void;
}>({ swapkit: new SwapKitCore(), keystoreConnected: false, setKeystoreConnected: () => {} });

export const useSwapKit = (config: Config) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configFile: _, ...swapkitConfig } = config;

  const [swapkit, setSwapKit] = useState(new SwapKitCore({ stagenet: swapkitConfig.stagenet }));

  swapkit.extend({ config: swapkitConfig, wallets: [keystoreWallet] });

  return { swapkit, setSwapKit };
};

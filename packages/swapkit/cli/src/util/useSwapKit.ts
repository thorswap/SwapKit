import type { SwapKitCore as SKC } from '@swapkit/core';
import { keystoreWallet } from '@swapkit/wallet-keystore';
import { createContext, useState } from 'react';

import type { Config } from './useConfig.js';
const { SwapKitCore } = await import('@swapkit/core');

export const SwapKitContext = createContext<{
  swapkit: SKC;
}>({ swapkit: new SwapKitCore() });

export const useSwapKit = (config: Config) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configFile: _, ...swapkitConfig } = config;

  const [swapkit, setSwapKit] = useState(new SwapKitCore({ stagenet: swapkitConfig.stagenet }));

  swapkit.extend({ config: swapkitConfig, wallets: [keystoreWallet] });

  return { swapkit, setSwapKit };
};

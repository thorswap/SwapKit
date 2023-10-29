import { Box, render } from 'ink';
import React, { useMemo, useState } from 'react';

import CheckBalance from './screens/CheckBalance.js';
import ConfigInit from './screens/ConfigInit.js';
import ConnectKeystore from './screens/ConnectKeystore.js';
import Exit from './screens/Exit.js';
import Swap from './screens/Swap.js';
import SwapKitMenu from './screens/SwapKitMenu.js';
import WelcomeScreen from './screens/WelcomeScreen.js';
import type { NavigationParams } from './types/navigation.js';
import { NavigationScreens as NS } from './types/navigation.js';
import { ConfigContext, useConfig } from './util/useConfig.js';
import { SwapKitContext, useSwapKit } from './util/useSwapKit.js';

export const NavigationContext = React.createContext<{
  navigation: NavigationParams;
  setNavigation: (screen: NavigationParams) => void;
}>({
  navigation: 'WelcomeScreen',
  setNavigation: () => {},
});

const Demo = () => {
  const [navigation, setNavigation] = useState<NavigationParams>('WelcomeScreen');

  const { config, setConfig } = useConfig();

  const { swapkit } = useSwapKit(config);
  const [keystoreConnected, setKeystoreConnected] = useState<boolean>(false);

  const output = useMemo(() => {
    switch (navigation) {
      case NS.WELCOME_SCREEN:
        return <WelcomeScreen />;

      case NS.SWAPKIT_MENU:
        return <SwapKitMenu />;
      case NS.CONNECT_KEYSTORE:
        return <ConnectKeystore />;

      case NS.CONFIG_INIT:
      case NS.CONFIG_EDIT:
        return <ConfigInit />;

      case NS.SWAP:
        return <Swap />;

      case NS.CHECK_BALANCE:
        return <CheckBalance />;

      case NS.EXIT:
        return <Exit />;
      default:
        console.log('default');
        return false;
    }
  }, [navigation]);

  return (
    <NavigationContext.Provider value={{ navigation, setNavigation }}>
      <ConfigContext.Provider value={{ config, setConfig }}>
        <SwapKitContext.Provider value={{ swapkit, keystoreConnected, setKeystoreConnected }}>
          <Box flexDirection="column" margin={2}>
            {output}
          </Box>
        </SwapKitContext.Provider>
      </ConfigContext.Provider>
    </NavigationContext.Provider>
  );
};

render(<Demo />);

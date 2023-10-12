import { Box, render } from 'ink';
import React, { useCallback, useMemo, useState } from 'react';

import ConfigInit from './screens/ConfigInit.js';
import Exit from './screens/Exit.js';
import WelcomeScreen from './screens/WelcomeScreen.js';
import { NavigationScreens as NS } from './types/navigation.js';
import { ConfigContext, useConfig } from './util/useConfig.js';

export const NavigationContext = React.createContext<{
  navigation: NS;
  setNavigation: (item: any) => void;
}>({
  navigation: NS.WELCOME_SCREEN,
  setNavigation: () => {},
});

const Demo = () => {
  const [navigation, setNavigation] = useState(NS.WELCOME_SCREEN);

  const { config, setConfig } = useConfig();

  const handleSelect = useCallback((item: any) => {
    setNavigation(item.value);
  }, []);

  const output = useMemo(() => {
    switch (navigation) {
      case NS.WELCOME_SCREEN:
        return <WelcomeScreen onSelect={handleSelect} />;
      case NS.CONFIG_INIT:
      case NS.CONFIG_EDIT:
        return <ConfigInit />;
      case NS.EXIT:
        return <Exit />;
      default:
        console.log('default');
        return false;
    }
  }, [handleSelect, navigation]);

  return (
    <NavigationContext.Provider value={{ navigation, setNavigation }}>
      <ConfigContext.Provider value={{ config, setConfig }}>
        <Box flexDirection="column" margin={2}>
          {output}
        </Box>
      </ConfigContext.Provider>
    </NavigationContext.Provider>
  );
};

render(<Demo />);

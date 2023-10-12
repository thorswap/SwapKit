import { Box, render } from 'ink';
import React, { useCallback, useMemo, useState } from 'react';

import ConfigInit from './screens/ConfigInit.js';
import WelcomeScreen from './screens/WelcomeScreen.js';
import { NavigationScreens as NS } from './types/navigation.js';
import { ConfigContext, useConfig } from './util/useConfig.js';

const Demo = () => {
  const [navigation, setNavigation] = useState(NS.WELCOME_SCREEN);

  console.log('loading config');
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
        return <ConfigInit setNavigation={setNavigation} />;
      default:
        console.log('default');
        return false;
    }
  }, [handleSelect, navigation]);

  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      <Box flexDirection="column" margin={2}>
        {output}
      </Box>
    </ConfigContext.Provider>
  );
};

render(<Demo />);

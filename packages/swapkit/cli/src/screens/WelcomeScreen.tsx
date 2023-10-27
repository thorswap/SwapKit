import { Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useContext } from 'react';

import { NavigationContext } from '../source.js';
import { NavigationScreens as NS } from '../types/navigation.js';
import { ConfigContext } from '../util/useConfig.js';

const WelcomeScreen = () => {
  const { config } = useContext(ConfigContext);

  const { setNavigation } = useContext(NavigationContext);

  const handleSelect = (item: any) => {
    setNavigation(item.value);
  };

  const items = config.configFile
    ? [
        {
          label: 'Open SwapKit Menu',
          value: NS.SWAPKIT_MENU,
        },
        {
          label: 'Edit SwapKit Config',
          value: NS.CONFIG_EDIT,
        },
        {
          label: 'Exit',
          value: NS.EXIT,
        },
      ]
    : [
        {
          label: 'Initialize SwapKit Config',
          value: NS.CONFIG_INIT,
        },
        {
          label: 'Exit',
          value: NS.EXIT,
        },
      ];

  return (
    <>
      <Text bold color="magenta">
        Welcome to SwapKit CLI
      </Text>
      <SelectInput items={items} onSelect={handleSelect} />
    </>
  );
};

export default WelcomeScreen;

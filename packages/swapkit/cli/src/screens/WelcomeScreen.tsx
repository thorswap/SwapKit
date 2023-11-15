import SelectInput from '@inkkit/ink-select-input';
import { Text } from 'ink';
import React, { useContext } from 'react';

import { NavigationContext } from '../source.js';
import type { SelectNavigatonParams } from '../types/navigation.js';
import { ConfigContext } from '../util/useConfig.js';

const WelcomeScreen = () => {
  const { config } = useContext(ConfigContext);

  const { setNavigation } = useContext(NavigationContext);

  const handleSelect = (item: SelectNavigatonParams) => {
    setNavigation(item.value);
  };

  const items: SelectNavigatonParams[] = config.configFile
    ? [
        {
          label: 'Open SwapKit Menu',
          value: 'SwapkitMenu',
        },
        {
          label: 'Edit SwapKit Config',
          value: 'ConfigEdit',
        },
        {
          label: 'Exit',
          value: 'Exit',
        },
      ]
    : [
        {
          label: 'Initialize SwapKit Config',
          value: 'ConfigInit',
        },
        {
          label: 'Exit',
          value: 'Exit',
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

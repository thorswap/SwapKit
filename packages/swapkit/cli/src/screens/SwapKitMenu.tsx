import SelectInput from '@inkkit/ink-select-input';
import { Text } from 'ink';
import React, { useContext } from 'react';

import { NavigationContext } from '../source.js';
import type { SelectNavigatonParams } from '../types/navigation.js';
import { SwapKitContext } from '../util/useSwapKit.js';

const SwapKitMenu = () => {
  const { setNavigation } = useContext(NavigationContext);

  const { keystoreConnected } = useContext(SwapKitContext);

  const handleSelect = (item: SelectNavigatonParams) => {
    setNavigation(item.value);
  };

  const items: SelectNavigatonParams[] = keystoreConnected
    ? [
        {
          label: 'Swap',
          value: 'Swap',
        },
        {
          label: 'Check Balance',
          value: 'CheckBalance',
        },
        {
          label: 'Back',
          value: 'WelcomeScreen',
        },
      ]
    : [
        {
          label: 'Connect Keystore',
          value: 'ConnectKeystore',
        },
        {
          label: 'Back',
          value: 'WelcomeScreen',
        },
      ];

  return (
    <>
      <Text bold color="magenta">
        SwapKit Menu
      </Text>
      <SelectInput items={items} onSelect={handleSelect} />
    </>
  );
};

export default SwapKitMenu;

import { Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useContext } from 'react';

import { NavigationContext } from '../source.js';
import { NavigationScreens as NS } from '../types/navigation.js';
import { SwapKitContext } from '../util/useSwapKit.js';

const SwapKitMenu = () => {
  const { setNavigation } = useContext(NavigationContext);

  const { swapkit } = useContext(SwapKitContext);

  const handleSelect = (item: any) => {
    setNavigation(item.value);
  };

  console.log(swapkit.connectedWallets);

  const items = [
    {
      label: 'Connect Keystore',
      value: NS.CONNECT_KEYSTORE,
    },
    {
      label: 'Exit',
      value: NS.WELCOME_SCREEN,
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

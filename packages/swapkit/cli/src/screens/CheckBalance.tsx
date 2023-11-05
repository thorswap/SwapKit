import SelectInput from '@inkkit/ink-select-input';
import Table from '@inkkit/ink-table';
import type { WalletMethods } from '@swapkit/core';
import { Text } from 'ink';
import React, { useContext, useMemo, useState } from 'react';

import { NavigationContext } from '../source.js';
import type { balanceData } from '../types/index.js';
import { SwapKitContext } from '../util/useSwapKit.js';

const CheckBalance = () => {
  const [balanceData, setBalanceData] = useState<balanceData[]>([]);

  const { setNavigation } = useContext(NavigationContext);
  const { swapkit } = useContext(SwapKitContext);

  const goBack = () => {
    setNavigation('SwapkitMenu');
  };

  const table = useMemo(() => {
    if (balanceData.length === 0) {
      for (const key in swapkit.connectedWallets) {
        const wallet = swapkit.connectedWallets[key as keyof WalletMethods];

        if (wallet) {
          const address = wallet.getAddress();
          if (typeof address === 'string') {
            wallet.getBalance(address).then((res) => {
              for (const assetValue of res) {
                setBalanceData((prev) => [
                  ...prev,
                  {
                    chain: key,
                    address: address,
                    symbol: assetValue.symbol,
                    balance: assetValue.toSignificant(6),
                  },
                ]);
              }
            });
          }
        }
      }
    }

    return <Table data={balanceData} />;
  }, [balanceData, swapkit.connectedWallets]);

  return (
    <>
      <Text bold color="magenta">
        Check Balance
      </Text>
      {table}
      <SelectInput items={[{ label: 'Back', value: goBack }]} onSelect={(item) => item.value()} />
    </>
  );
};

export default CheckBalance;

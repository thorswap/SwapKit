import SelectInput from '@inkkit/ink-select-input';
import TextInput from '@inkkit/ink-text-input';
import { Box, Text } from 'ink';
import React, { useState } from 'react';

import SelectToken from './SelectToken.js';

export type SwapSelectItem = {
  label: string;
  value: 'from' | 'to' | 'amount';
};

const Swap = () => {
  //const { setNavigation } = useContext(NavigationContext);

  const [fromIdentifier, setFromIdentifier] = useState('');
  const [toIdentifier, setToIdentifier] = useState('');

  const from = fromIdentifier.split('-')[0];
  const to = toIdentifier.split('-')[0];

  const [amount, setAmount] = useState('0');

  const [nav, setNav] = useState<SwapSelectItem['value'] | 'swapmenu'>('swapmenu');

  const items: SwapSelectItem[] = [
    {
      label: 'From: ',
      value: 'from',
    },
    {
      label: 'To: ',
      value: 'to',
    },
    {
      label: 'Amount: ',
      value: 'amount',
    },
  ];

  //const { swapkit } = useContext(SwapKitContext);

  // const handleSelect = (item: any) => {
  //   setNavigation(item.value);
  // };

  switch (nav) {
    case 'from':
      return (
        <SelectToken
          setFrom={setFromIdentifier}
          setNav={setNav}
          setTo={setToIdentifier}
          type="from"
        />
      );
    case 'to':
      return (
        <SelectToken
          selectedFrom={fromIdentifier}
          setNav={setNav}
          setTo={setToIdentifier}
          type="to"
        />
      );
    case 'amount':
      break;
    case 'swapmenu':
      break;
  }

  return (
    <>
      <Text bold color="magenta">
        Swap
      </Text>
      <Box flexDirection="column">
        <SelectInput
          isFocused={nav === 'swapmenu'}
          // @ts-expect-error
          itemComponent={(item) => {
            const value = item.label === 'From: ' ? from : item.label === 'To: ' ? to : amount;
            const isAmount = item.label === 'Amount: ';
            return (
              <>
                <Text bold>{item.label}</Text>
                {isAmount ? (
                  <>
                    {nav === 'amount' ? (
                      <Box marginRight={1}>
                        <TextInput
                          focus={nav === 'amount'}
                          onChange={setAmount}
                          onSubmit={(value) => {
                            value === '' && setAmount('0');
                            setNav('swapmenu');
                          }}
                          showCursor={false}
                          type="numeric"
                          value={amount}
                        />
                      </Box>
                    ) : (
                      <Text color="yellow">{value + ' '}</Text>
                    )}
                    <Text color="green">{from}</Text>
                  </>
                ) : (
                  <Text color="green">{value}</Text>
                )}
              </>
            );
          }}
          items={items}
          onSelect={(item) => setNav(item.value)}
          wrapperProps={({ item }) => ({
            marginY: item.value === 'amount' ? 1 : 0,
          })}
        />
      </Box>
    </>
  );
};

export default Swap;

import SelectInput from '@inkkit/ink-select-input';
import TextInput from '@inkkit/ink-text-input';
import type { ConnectConfig } from '@swapkit/sdk';
import { Box, Text } from 'ink';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { NavigationContext } from '../source.js';
import type { ConfigEditItems } from '../types/navigation.js';
import { CONFIG_EDIT_ITEMS as CEI } from '../types/navigation.js';
import { ConfigContext, saveConfig } from '../util/useConfig.js';

const stagenetItems = [true, false].map((value) => ({ label: value.toString(), value }));

const itemLabels = {
  [CEI.COVALENT_API_KEY]: 'Covalent API Key',
  [CEI.ETHPLORER_API_KEY]: 'Ethplorer API Key',
  [CEI.UTXO_API_KEY]: 'Utxo API Key',
  [CEI.STAGENET]: 'Stagenet',
  [CEI.FINISH]: 'Finish',
};

const items = ({ covalentApiKey, ethplorerApiKey, utxoApiKey, stagenet }: ConnectConfig) => [
  {
    label: `${itemLabels[CEI.COVALENT_API_KEY]}: ${covalentApiKey}`,
    value: { value: CEI.COVALENT_API_KEY, index: 0 },
    key: 'covalent',
  },
  {
    label: `${itemLabels[CEI.ETHPLORER_API_KEY]}: ${ethplorerApiKey}`,
    value: { value: CEI.ETHPLORER_API_KEY, index: 1 },
    key: 'ethplorer',
  },
  {
    label: `${itemLabels[CEI.UTXO_API_KEY]}: ${utxoApiKey}`,
    value: { value: CEI.UTXO_API_KEY, index: 2 },
    key: 'utxo',
  },
  {
    label: `${itemLabels[CEI.STAGENET]}: ${stagenet}`,
    value: { value: CEI.STAGENET, index: 3 },
    key: 'stagenet',
  },
  { label: itemLabels[CEI.FINISH], value: { value: CEI.FINISH, index: 4 }, key: 'finish' },
];

const ConfigInit = () => {
  const [query, setQuery] = useState('');
  const [goBack, setGoBack] = useState(false);
  const [updateConfig, setUpdateConfig] = useState(false);

  const { setNavigation } = useContext(NavigationContext);
  const { config, setConfig } = useContext(ConfigContext);

  const [focus, setFocus] = useState<ConfigEditItems | -1>(-1);

  const [lastSelect, setLastSelect] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configFile: _, ...rest } = config;
  const [initConfig, setInitconfig] = useState<ConnectConfig>(rest);

  useEffect(() => {
    if (goBack) {
      setNavigation('WelcomeScreen');
    }
    if (updateConfig) {
      setConfig({ ...initConfig, configFile: true });
    }
  }, [goBack, setNavigation, updateConfig, initConfig, setConfig]);

  const handleSubmit = useCallback(() => {
    switch (focus) {
      case CEI.COVALENT_API_KEY:
        setInitconfig({ ...initConfig, covalentApiKey: query });
        break;
      case CEI.ETHPLORER_API_KEY:
        setInitconfig({ ...initConfig, ethplorerApiKey: query });
        break;
      case CEI.UTXO_API_KEY:
        setInitconfig({ ...initConfig, utxoApiKey: query });
        break;
      case CEI.FINISH:
        setGoBack(true);
        setUpdateConfig(true);
        saveConfig(initConfig);
        break;
    }

    setFocus(-1);

    setQuery('');
  }, [focus, initConfig, query]);

  const staganetOnSelect = useCallback(
    (item: (typeof stagenetItems)[number]) => {
      setInitconfig({ ...initConfig, stagenet: item.value });

      setFocus(-1);
    },
    [initConfig],
  );

  const handleSelect = useCallback(
    ({ value: { value, index } }: { value: { value: ConfigEditItems; index: number } }) => {
      setLastSelect(index);
      setFocus(value);
    },
    [],
  );

  const configItems = useMemo(() => items(initConfig), [initConfig]);

  return (
    <Box flexDirection="column" rowGap={1}>
      <Text bold color="magenta">
        SwapKit Config
      </Text>
      {focus === -1 ? (
        <SelectInput
          initialIndex={lastSelect}
          // @ts-expect-error Notify about missing types
          itemComponent={(data) => {
            const label = data.label.split(':')[0];
            const value = data.label.split(':')[1]?.trim();

            return (
              <Text
                color={data.isSelected ? 'blue' : data.label === 'Finish' ? 'redBright' : 'white'}
              >
                {label === 'Finish' ? 'Save Config' : label + ': '}
                {label === 'Finish' ? (
                  ''
                ) : value ? (
                  <Text color="gray">{value}</Text>
                ) : (
                  <Text color="yellow">{'<empty>'}</Text>
                )}
              </Text>
            );
          }}
          items={configItems}
          onSelect={handleSelect}
        />
      ) : focus === CEI.STAGENET ? (
        <Box>
          <Text color="green">{itemLabels[focus]}</Text>
          <Text>: </Text>
          <SelectInput items={stagenetItems} onSelect={staganetOnSelect} />
        </Box>
      ) : focus === CEI.FINISH ? (
        <>{handleSubmit()}</>
      ) : (
        <Box>
          <Text color="green">{itemLabels[focus]}</Text>
          <Text>: </Text>
          <TextInput onChange={setQuery} onSubmit={handleSubmit} value={query} />
        </Box>
      )}
    </Box>
  );
};

export default ConfigInit;

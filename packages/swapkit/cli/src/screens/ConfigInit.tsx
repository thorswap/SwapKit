import type { ConnectConfig } from '@swapkit/sdk';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { NavigationContext } from '../source.js';
import type { ConfigEditItems } from '../types/navigation.js';
import { CONFIG_EDIT_ITEMS as CEI } from '../types/navigation.js';
import { ConfigContext, saveConfig } from '../util/useConfig.js';

const ConfigInit = () => {
  const [query, setQuery] = useState('');
  const [goBack, setGoBack] = useState(false);
  const [updateConfig, setUpdateConfig] = useState(false);

  const { setNavigation } = useContext(NavigationContext);
  const { config, setConfig } = useContext(ConfigContext);

  const [focus, setFocus] = useState<ConfigEditItems | -1>(-1);

  const [lastSelect, setLastSelect] = useState(0);

  const [inputFocus, setInputFocus] = useState(0);
  const [query2, setQuery2] = useState('');

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
      case CEI.WALLET_CONNECT_PROJECT_ID:
        setInitconfig({ ...initConfig, walletConnectProjectId: query });
        break;
      case CEI.TREZOR_CREDENTIALS:
        setInitconfig({
          ...initConfig,
          trezorManifest: {
            email: query,
            appUrl: query2,
          },
        });
        break;
      case CEI.FINISH:
        setGoBack(true);
        setUpdateConfig(true);
        saveConfig(initConfig);
        break;
    }

    setFocus(-1);

    setQuery('');
    setQuery2('');

    setInputFocus(0);
  }, [focus, initConfig, query, query2]);

  const handleEmailSubmit = () => {
    setInputFocus(1);
  };

  const staganetOnSelect = useCallback(
    (item: (typeof staganetItems)[number]) => {
      setInitconfig({ ...initConfig, stagenet: item.value });

      setFocus(-1);
    },
    [initConfig],
  );

  const handleSelect = (item: (typeof items)[number]) => {
    setLastSelect(item.value.index);
    setFocus(item.value.value);
  };

  const itemLabels = {
    [CEI.COVALENT_API_KEY]: 'Covalent API Key',
    [CEI.ETHPLORER_API_KEY]: 'Ethplorer API Key',
    [CEI.UTXO_API_KEY]: 'Utxo API Key',
    [CEI.WALLET_CONNECT_PROJECT_ID]: 'Wallet Connect Project ID',
    [CEI.TREZOR_CREDENTIALS]: 'Trezor Credentials',
    [CEI.STAGENET]: 'Stagenet',
    [CEI.FINISH]: 'Finish',
  };

  const items: {
    label: string;
    value: { value: ConfigEditItems; index: number };
    key?: string;
  }[] = [
    {
      label: itemLabels[CEI.COVALENT_API_KEY] + ': ' + initConfig.covalentApiKey,
      value: { value: CEI.COVALENT_API_KEY, index: 0 },
      key: 'covalent',
    },
    {
      label: itemLabels[CEI.ETHPLORER_API_KEY] + ': ' + initConfig.ethplorerApiKey,
      value: { value: CEI.ETHPLORER_API_KEY, index: 1 },
      key: 'ethplorer',
    },
    {
      label: itemLabels[CEI.UTXO_API_KEY] + ': ' + initConfig.utxoApiKey,
      value: { value: CEI.UTXO_API_KEY, index: 2 },
      key: 'utxo',
    },
    {
      label: itemLabels[CEI.WALLET_CONNECT_PROJECT_ID] + ': ' + initConfig.walletConnectProjectId,
      value: { value: CEI.WALLET_CONNECT_PROJECT_ID, index: 3 },
      key: 'walletConnect',
    },
    {
      label:
        itemLabels[CEI.TREZOR_CREDENTIALS] +
        ': ' +
        initConfig.trezorManifest?.email +
        ' ' +
        initConfig.trezorManifest?.appUrl,
      value: { value: CEI.TREZOR_CREDENTIALS, index: 4 },
      key: 'trezor',
    },
    {
      label: itemLabels[CEI.STAGENET] + ': ' + initConfig.stagenet,
      value: { value: CEI.STAGENET, index: 5 },
      key: 'stagenet',
    },
    {
      label: itemLabels[CEI.FINISH],
      value: { value: CEI.FINISH, index: 6 },
      key: 'finish',
    },
  ];

  const staganetItems = [
    {
      label: 'true',
      value: true,
    },
    {
      label: 'false',
      value: false,
    },
  ];

  return (
    <Box flexDirection="column" rowGap={1}>
      <Text bold color="magenta">
        SwapKit Config
      </Text>
      {focus === -1 ? (
        <SelectInput
          initialIndex={lastSelect}
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
          items={items}
          onSelect={handleSelect}
        />
      ) : focus === CEI.STAGENET ? (
        <Box>
          <Text color="green">{itemLabels[focus]}</Text>
          <Text>: </Text>
          <SelectInput items={staganetItems} onSelect={staganetOnSelect} />
        </Box>
      ) : focus === CEI.TREZOR_CREDENTIALS ? (
        <Box flexDirection="column">
          <Text>{itemLabels[focus]}</Text>
          <Box flexDirection="column" marginTop={1}>
            <Box>
              <Text color="green">Email</Text>
              <Text>: </Text>
              <TextInput
                focus={inputFocus === 0 ? true : false}
                onChange={setQuery}
                onSubmit={handleEmailSubmit}
                value={query}
              />
            </Box>
            <Box>
              <Text color="green">App URL</Text>
              <Text>: </Text>
              <TextInput
                focus={inputFocus === 1 ? true : false}
                onChange={setQuery2}
                onSubmit={handleSubmit}
                value={query2}
              />
            </Box>
          </Box>
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

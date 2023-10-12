import type { ConnectConfig } from '@swapkit/sdk';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { NavigationContext } from '../source.js';
import { ConfigEditItems as CEI, NavigationScreens as NS } from '../types/navigation.js';
import { ConfigContext, saveConfig } from '../util/useConfig.js';

const ConfigInit = () => {
  const [query, setQuery] = useState('');
  const [nav, setNav] = useState(false);
  const [updateConfig, setUpdateConfig] = useState(false);

  const { setNavigation } = useContext(NavigationContext);
  const { config, setConfig } = useContext(ConfigContext);

  const [focus, setFocus] = useState(-1);

  const [lastSelect, setLastSelect] = useState(0);

  const [inputFocus, setInputFocus] = useState(0);
  const [query2, setQuery2] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configFile: _, ...rest } = config;
  const [initConfig, setInitconfig] = useState<ConnectConfig>(rest);

  useEffect(() => {
    if (nav) {
      setNavigation(NS.WELCOME_SCREEN);
    }
    if (updateConfig) {
      setConfig({ ...initConfig, configFile: true });
    }
  }, [nav, setNavigation, updateConfig, initConfig, setConfig]);

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
        setNav(true);
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
    (item: any | (() => any)) => {
      setInitconfig({ ...initConfig, stagenet: item.value === 1 ? true : false });

      setFocus(-1);
    },
    [initConfig],
  );

  const handleSelect = useCallback((item: any) => {
    setLastSelect(item.value);
    setFocus(item.value);
  }, []);

  const itemLabels = [
    'Covalent API Key',
    'Ethplorer API Key',
    'Utxo API Key',
    'Wallet Connect Project ID',
    'Trezor Credentials',
    'Stagenet',
  ];

  const items = [
    {
      label: itemLabels[0] + ': ' + initConfig.covalentApiKey,
      value: CEI.COVALENT_API_KEY,
    },
    {
      label: itemLabels[1] + ': ' + initConfig.ethplorerApiKey,
      value: CEI.ETHPLORER_API_KEY,
    },
    {
      label: itemLabels[2] + ': ' + initConfig.utxoApiKey,
      value: CEI.UTXO_API_KEY,
    },
    {
      label: itemLabels[3] + ': ' + initConfig.walletConnectProjectId,
      value: CEI.WALLET_CONNECT_PROJECT_ID,
    },
    {
      label:
        itemLabels[4] +
        ': ' +
        initConfig.trezorManifest?.email +
        ' ' +
        initConfig.trezorManifest?.appUrl,
      value: CEI.TREZOR_CREDENTIALS,
    },
    {
      label: itemLabels[5] + ': ' + initConfig.stagenet,
      value: CEI.STAGENET,
    },
    {
      label: 'Finish',
      value: CEI.FINISH,
    },
  ];

  const staganetItems = [
    {
      label: 'true',
      value: 1,
    },
    {
      label: 'false',
      value: 0,
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

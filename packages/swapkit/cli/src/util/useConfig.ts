import type { ConnectConfig } from '@swapkit/sdk';
import filesystem from 'node:fs';
import React, { useEffect, useState } from 'react';

export type Config = ConnectConfig & { configFile: boolean };

export const ConfigContext = React.createContext<{
  config: Config;
  setConfig: (config: Config) => void;
}>({
  setConfig: () => {},
  config: {
    covalentApiKey: '',
    ethplorerApiKey: '',
    stagenet: false,
    trezorManifest: { email: '', appUrl: '' },
    utxoApiKey: '',
    walletConnectProjectId: '',
    configFile: false,
  },
});

export const useConfig = () => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const exists = filesystem.existsSync('./config.json');

  const fs = filesystem.promises;

  useEffect(() => {
    async function loadconfig() {
      const config = exists ? await fs.readFile('./config.json', 'utf8') : undefined;

      if (config) {
        try {
          setConfig({ ...JSON.parse(config), configFile: true });
        } catch (err) {
          console.log('Error while parsing JSON config:', err);
        }
      }
    }

    loadconfig();
  }, [fs, exists]);

  if (!config) {
    return {
      config: {
        covalentApiKey: '',
        ethplorerApiKey: '',
        stagenet: false,
        trezorManifest: { email: '', appUrl: '' },
        utxoApiKey: '',
        walletConnectProjectId: '',

        configFile: false,
      },
      setConfig,
    };
  }

  return { config, setConfig };
};

export const saveConfig = async (config: ConnectConfig) => {
  const fs = filesystem.promises;

  await fs.writeFile('./config.json', JSON.stringify(config, null, 2));
};

import TextInput from '@inkkit/ink-text-input';
import { decryptFromKeystore } from '@coinmasters/wallet-keystore';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React, { useContext, useEffect, useState } from 'react';

import { NavigationContext } from '../source.js';
import { CONNECTED_CHAINS } from '../types/index.js';
import { useJsonFile } from '../util/useJsonFile.js';
import { SwapKitContext } from '../util/useSwapKit.js';

const ConnectKeystore = () => {
  const { json: keystoreFile, loading } = useJsonFile('thorswap-keystore.txt');
  const [password, setPassword] = useState<string>('');
  const [invalidPassword, setInvalidPassword] = useState<boolean>(false);

  const { setNavigation } = useContext(NavigationContext);

  const [goBack, setGoBack] = useState<boolean>(false);

  const { swapkit, setKeystoreConnected } = useContext(SwapKitContext);

  useEffect(() => {
    if (goBack) {
      setNavigation('SwapkitMenu');
    }
  }, [goBack, setNavigation]);

  const handleSubmit = () => {
    if (password === '') {
      return;
    }
    decryptFromKeystore(keystoreFile, password).then(
      (res) => {
        swapkit.connectKeystore(CONNECTED_CHAINS, res).then(() => {
          setKeystoreConnected(true);
          setGoBack(true);
        });
      },
      () => {
        setInvalidPassword(true);
        setTimeout(() => {
          setGoBack(true);
        }, 1000);
      },
    );
  };

  return (
    <>
      <Text bold color="magenta">
        Connect Keystore
      </Text>
      {loading ? (
        <Text>
          <Text color="green">
            <Spinner />
          </Text>
          {' Loading'}
        </Text>
      ) : keystoreFile ? (
        <Box>
          <Text color="red">{'Password: '}</Text>
          <TextInput mask="*" onChange={setPassword} onSubmit={handleSubmit} value={password} />
        </Box>
      ) : (
        <Text color="redBright">No keystore file found</Text>
      )}
      {invalidPassword && <Text color="redBright">Invalid Password</Text>}
    </>
  );
};

export default ConnectKeystore;

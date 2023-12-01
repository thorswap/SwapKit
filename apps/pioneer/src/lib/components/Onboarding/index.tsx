import { CheckIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import pioneerImage from '../../assets/png/pioneerMan.png';
import { getWalletContent } from '../../components/WalletIcon';
import { usePioneer } from '../../context/Pioneer';

export default function Pubkeys({ onClose, setModalType, setWalletType }: any) {
  const { state, connectWallet, onStart } = usePioneer();
  const { app } = state;
  const [server, setServer] = useState('https://pioneers.dev/spec/swagger.json');
  const [showWalletSelection, setShowWalletSelection] = useState(false);
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [walletsAvailable, setWalletsAvailable] = useState([]);

  const onStartApp = async function () {
    try {
      console.log('onStart');
      if (app && app.wallets) {
        setWalletsAvailable(app.wallets);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    onStartApp();
  }, [app, app?.wallets, app?.isPioneer]);

  useEffect(() => {
    let pioneerUrl = localStorage.getItem('pioneerUrl');
    if (pioneerUrl) {
      setShowWalletSelection(true);
      onStart();
    }
  }, []);

  const handleWalletClick = async (wallet: string) => {
    wallet = wallet.toUpperCase();
    // setPioneerImage('');
    setWalletType(wallet);
    setModalType(wallet);
    console.log('Clicked wallet:', wallet);
    const resultPair = await connectWallet(wallet);
    console.log('resultPair: ', resultPair);
  };

  const handleServerChange = (event) => {
    setServer(event.target.value);
  };

  const handleSubmit = async () => {
    localStorage.setItem('pioneerUrl', server);
    console.log('Server:', server);
    await onStart();
    setShowWalletSelection(true);
  };

  const isDefaultServer = server === 'https://pioneers.dev/spec/swagger.json';

  const toggleShowAllWallets = () => {
    setShowAllWallets(!showAllWallets);
  };

  const renderWallets = () => {
    const walletsToDisplay = showAllWallets
      ? walletsAvailable
      : walletsAvailable.filter((wallet) =>
          ['METAMASK', 'KEEPKEY', 'LEDGER'].includes(wallet.type),
        );
    return walletsToDisplay.map((wallet) => (
      <Box
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
        key={wallet.type}
        onClick={() => handleWalletClick(wallet.type)}
        p={2}
      >
        {getWalletContent(wallet.type)}
        <Text fontSize="sm">{wallet.type}</Text>
      </Box>
    ));
  };

  // Server Selection UI
  const ServerSelectionUI = () => (
    <Stack spacing={4}>
      <Flex alignItems="center">
        <Avatar size="xl" src={pioneerImage} />
        <Text fontStyle="italic" ml={4} textAlign="right">
          Welcome to the world of pioneer, to start your journey you can select your pioneer server,
          if you have a custom pioneer server you can insert it here. Default is
          <Link isExternal color="blue.500" href="https://pioneers.dev/docs">
            {' '}
            pioneers.dev
          </Link>
        </Text>
      </Flex>

      <InputGroup>
        <Input onChange={handleServerChange} placeholder="Enter server URL" value={server} />
        {isDefaultServer && <InputRightElement children={<CheckIcon color="green.500" />} />}
      </InputGroup>

      <Button colorScheme="blue" onClick={handleSubmit}>
        Next
      </Button>

      <Box>
        <Link isExternal href="https://example.com/deploy-server">
          Click here to learn how to deploy a pioneer server
        </Link>
      </Box>
    </Stack>
  );

  // Wallet Selection UI
  const WalletSelectionUI = () => (
    <Stack spacing={4}>
      <Text>Connect your Wallet...</Text>
      <SimpleGrid columns={3} spacing={2}>
        {renderWallets()}
      </SimpleGrid>
      <Button colorScheme="blue" mt={2} onClick={toggleShowAllWallets} size="sm">
        {showAllWallets ? 'Hide Wallets' : 'Show All Wallets'}
      </Button>
      <Text color="blue.500" cursor="pointer" mb={2} mt={4}>
        I dont have a wallet
      </Text>
      <Button colorScheme="green">Create New Wallet</Button>
    </Stack>
  );

  return showWalletSelection ? WalletSelectionUI() : ServerSelectionUI();
}

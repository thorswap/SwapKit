import {
  CircularProgress,
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react';

import KeepKey from '../../components/KeepKey';
import Ledger from '../../components/Ledger';
import MetaMask from '../../components/MetaMask';

import { useEffect, useState } from 'react';
import { FaCog } from 'react-icons/fa';
import MiddleEllipsis from '../../components/MiddleEllipsis';
import { usePioneer } from '../../context/Pioneer';

import {
  getWalletContent,
  getWalletBadgeContent,
  pioneerImagePng,
} from '../../components/WalletIcon';

const Pioneer = () => {
  const { state, connectWallet } = usePioneer();
  const { api, app, status, balances, context } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [modalShowClose, setModalShowClose] = useState(false);
  const [modalType, setModalType] = useState('');
  // local
  const [walletsAvailable, setWalletsAvailable] = useState([]);
  const [walletType, setWalletType] = useState('');
  const [pioneerImage, setPioneerImage] = useState('');
  // const [context, setContext] = useState('');
  const [isPioneer, setIsPioneer] = useState(false);
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false);

  // Function to toggle the visibility of all wallets
  const toggleShowAllWallets = () => {
    setShowAllWallets(!showAllWallets);
  };

  useEffect(() => {
    if (context) {
      console.log('context: ', context);
      setWalletType(context.split(':')[0]);
    }
  }, [context, app]);

  useEffect(() => {
    if (context && app.isPioneer) {
      console.log('context: ', context);
      setWalletType(context.split(':')[0]);
      setPioneerImage(app.isPioneer);
    }
  }, [context, app, app?.isPioneer]);

  const handleWalletClick = async (wallet: {
    type: any;
    icon?: string | undefined;
    isConnected?: any;
  }) => {
    setIsSwitchingWallet(true);
    // setPioneerImage('');
    onOpen();
    setWalletType(wallet.type);
    setModalType(wallet.type);
    setModalShowClose(false);
    console.log('Clicked wallet:', wallet.type);
    const resultPair = await connectWallet(wallet.type);
    console.log('resultPair: ', resultPair);
    setIsSwitchingWallet(false);
  };

  const renderWallets = () => {
    const walletsToDisplay: any = showAllWallets
      ? walletsAvailable
      : walletsAvailable.filter((wallet: any) =>
          ['metamask', 'keepkey', 'ledger'].includes(wallet.type.toLowerCase())
        );
    return walletsToDisplay.map((wallet: any) => (
      <Card key={wallet.type} onClick={() => handleWalletClick(wallet)}>
        <CardBody>
          <Avatar src={wallet.icon}>
            {wallet.isConnected ? (
              <AvatarBadge boxSize="1.25em" bg="green.500" />
            ) : (
              <AvatarBadge boxSize="1.25em" bg="red.500" />
            )}
          </Avatar>
        </CardBody>
        <small>{wallet.type}</small>
      </Card>
    ));
  };

  const onStart = async function () {
    try {
      console.log('onStart');
      console.log('wallets', app.wallets);
      if (app.wallets) {
        setWalletsAvailable(app.wallets);
      }
      if (app.isPioneer) {
        console.log('app.isPioneer: ', app.isPioneer);
        setIsPioneer(true);
        setPioneerImage(app.isPioneer);
      }
      const pioneerCache = localStorage.getItem('isPioneer');
      if (pioneerCache) {
        setIsPioneer(true);
        setPioneerImage(pioneerCache);
      }
      if (balances && balances.length > 0) {
        console.log('balances: ', balances);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    onStart();
  }, [app, app?.wallets, app?.isPioneer]);

  const settingsSelected = async function () {
    try {
      // console.log("settingsSelected");
      onOpen();
    } catch (e) {
      console.error(e);
    }
  };

  // const setContextWallet = async function (wallet: string) {
  //   try {
  //   } catch (e) {
  //     console.error('header e: ', e);
  //   }
  // };

  const setUser = async function () {
    try {
      console.log('wallets: ', app?.wallets);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-console
      console.error('header e: ', e);
      // setKeepKeyError("Bridge is offline!");
    }
  };

  useEffect(() => {
    setUser();
  }, [status, app, app?.wallets]);

  const avatarContent = api ? (
    getWalletBadgeContent(walletType)
  ) : (
    <AvatarBadge boxSize="1em" bg="red.500">
      <CircularProgress isIndeterminate size="1em" color="white" />
    </AvatarBadge>
  );

  return (
    <div>
      <Modal isOpen={isOpen} onClose={() => onClose()} size="xl">
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalHeader>{modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Render content based on modalType */}
            {modalType === 'KEEPKEY' && (
              <div>
                <KeepKey onClose={onClose} />
              </div>
            )}
            {modalType === 'METAMASK' && (
              <div>
                <MetaMask onClose={onClose} />
              </div>
            )}
            {modalType === 'LEDGER' && (
              <div>
                <Ledger />
              </div>
            )}
            {modalType === 'Trezor' && <div>Trezor TODO</div>}
            {modalType === 'Xdefi' && <div>Trezor TODO</div>}
          </ModalBody>
          <ModalFooter>
            {modalShowClose ? (
              <div>
                <Button colorScheme="blue" onClick={onClose}>
                  Close
                </Button>
              </div>
            ) : (
              <div />
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Menu>
        <MenuButton
          as={Button}
          rounded="full"
          variant="link"
          cursor="pointer"
          minW={100}
        >
          <Avatar size="lg">
            {isSwitchingWallet ? (
              <div>
                <Box position="relative" display="inline-block">
                  <Avatar size="lg" src={pioneerImage} />
                  <CircularProgress
                    isIndeterminate
                    size="1.25em"
                    color="green.500"
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                  />
                </Box>
              </div>
            ) : (
              <div>
                {isPioneer ? (
                  <Avatar size="lg" src={pioneerImage}>
                    {avatarContent}
                  </Avatar>
                ) : (
                  <Avatar size="lg" src={pioneerImagePng}>
                    {avatarContent}
                  </Avatar>
                )}
              </div>
            )}
          </Avatar>
        </MenuButton>
        <MenuList>
          <Box borderBottomWidth="1px" p="4">
            <HStack justifyContent="space-between">
              <Button leftIcon={getWalletContent(walletType)}>
                <small>
                  <MiddleEllipsis text={context} />
                </small>
              </Button>
              <IconButton
                icon={<FaCog />}
                isRound
                onClick={() => settingsSelected()}
                aria-label="Settings"
              />
              {/* <SettingsModal isOpen={isOpen} onClose={onClose} /> */}
            </HStack>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p="4"
            textAlign="left"
            maxWidth="300px"
            width="100%"
          >
            <div>
              <Flex alignItems="center">
                <small>status: {status}</small>
              </Flex>
              <Card
                p={2}
                borderRadius="md"
                boxShadow="sm"
                mb={2}
                className="caip"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center">
                    <Avatar
                      size="md"
                      src={
                        app?.assetContext?.image ||
                        'https://pioneers.dev/coins/ethereum.png'
                      }
                      mr={2}
                    />
                    <Box fontSize="sm" fontWeight="bold">
                      Asset:
                    </Box>
                  </Flex>
                  <Box fontSize="sm" textAlign="right">
                    <MiddleEllipsis text={app?.assetContext?.symbol} />
                  </Box>
                </Flex>
                <Flex justifyContent="space-between">
                  <Box fontSize="xs" />
                  <Box fontSize="xs" textAlign="right">
                    caip:
                    <MiddleEllipsis text={app?.assetContext?.caip} />
                  </Box>
                </Flex>
              </Card>

              {/* Blockchain Card */}
              <Card
                p={2}
                borderRadius="md"
                boxShadow="sm"
                mb={2}
                className="caip"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center">
                    <Avatar
                      size="md"
                      src={
                        app?.blockchainContext?.image ||
                        'https://pioneers.dev/coins/ethereum.png'
                      }
                      mr={2}
                    />
                    <Box fontSize="sm" fontWeight="bold">
                      Blockchain:
                    </Box>
                  </Flex>
                  <Box fontSize="sm" textAlign="right">
                    {app?.blockchainContext?.name}
                  </Box>
                </Flex>
                <Flex justifyContent="space-between">
                  <Box fontSize="xs" />
                  <Box fontSize="xs" textAlign="right">
                    caip:
                    <MiddleEllipsis text={app?.blockchainContext?.caip} />
                  </Box>
                </Flex>
              </Card>

              {/* Pubkey Card */}
              <Card p={2} borderRadius="md" boxShadow="sm" className="caip">
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center">
                    <Box fontSize="sm" fontWeight="bold">
                      Pubkey Path:
                    </Box>
                  </Flex>
                  <Box fontSize="sm" textAlign="right">
                    <MiddleEllipsis text={app?.pubkeyContext?.path} />
                  </Box>
                </Flex>
                <Flex justifyContent="space-between">
                  <Box fontSize="xs">Pubkey:</Box>
                  <Box fontSize="xs" textAlign="right">
                    <MiddleEllipsis text={app?.pubkeyContext?.pubkey} />
                  </Box>
                </Flex>
              </Card>
            </div>
          </Box>

          <MenuItem>
            <SimpleGrid columns={3} row={1} maxWidth="280px">
              {renderWallets()}
              <Text
                fontSize="sm"
                cursor="pointer"
                color="blue.500"
                onClick={toggleShowAllWallets}
              >
                {showAllWallets ? 'Hide Wallets' : 'Show All Wallets'}
              </Text>
            </SimpleGrid>
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};

export default Pioneer;

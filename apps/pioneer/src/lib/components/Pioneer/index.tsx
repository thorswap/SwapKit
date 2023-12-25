import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Card,
  CardBody,
  CircularProgress,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ChainToNetworkId, getChainEnumValue, availableChainsByWallet } from '@coinmasters/types';
import { useEffect, useState } from 'react';
import { FaCog, FaDownload, FaExchangeAlt, FaPaperPlane, FaRegMoneyBillAlt } from 'react-icons/fa';

import KeepKey from '../../components/KeepKey';
import Ledger from '../../components/Ledger';
import MetaMask from '../../components/MetaMask';
import Receive from '../../components/Receive';
import MiddleEllipsis from '../../components/MiddleEllipsis';
import Onboarding from '../../components/Onboarding';
import Settings from '../../components/Settings';
import Swap from '../../components/Swap';
import Transfer from '../../components/Transfer';
import {
  getWalletBadgeContent,
  getWalletContent,
  pioneerImagePng,
} from '../../components/WalletIcon';
import { usePioneer } from '../../context';
import Portfolio from '../../components/Portfolio';

const Pioneer = () => {
  const { state, hideModal, resetState } = usePioneer();
  const { api, app, balances, context, openModal } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showAllWallets, setShowAllWallets] = useState(false);
  const [modalShowClose, setModalShowClose] = useState(false);
  const [modalType, setModalType] = useState('');
  //const [pairedWallets, setPairedWallets] = useState([]);
  const [walletsAvailable, setWalletsAvailable] = useState([]);
  const [walletType, setWalletType] = useState('');
  const [pioneerImage, setPioneerImage] = useState('');
  // const [context, setContext] = useState('');
  const [isPioneer, setIsPioneer] = useState(false);
  const [isSwitchingWallet, setIsSwitchingWallet] = useState(false);

  useEffect(() => {
    if (openModal) {
      setModalType(openModal.toUpperCase());
      onOpen();
    } else {
      hideModal();
      onClose();
    }
  }, [openModal]);

  // Function to toggle the visibility of all wallets
  const toggleShowAllWallets = (e) => {
    e.stopPropagation();
    setShowAllWallets(!showAllWallets);
  };

  // start the context provider
  useEffect(() => {
    let pioneerUrl = localStorage.getItem('pioneerUrl');
    if (balances.length === 0 && !pioneerUrl) {
      onOpen();
      setModalType('ONBOARDING');
    }
  }, [balances]);

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

  const handleWalletClick = async (wallet: string) => {
    setIsSwitchingWallet(true);
    resetState();
    //clear balances
    //clear pubkeys
    //clear context
    //clear blockchains
    const AllChainsSupported = availableChainsByWallet[wallet];
    console.log('AllChainsSupported: ', AllChainsSupported);
    let allByCaip = AllChainsSupported.map((chainStr) => {
      const chainEnum = getChainEnumValue(chainStr);
      return chainEnum ? ChainToNetworkId[chainEnum] : undefined;
    }).filter((x) => x !== undefined);
    app.setBlockchains(allByCaip);
    onOpen();
    setWalletType(wallet);
    setModalType(wallet);
    setModalShowClose(false);
  };

  const renderWallets = () => {
    const walletsToDisplay = showAllWallets
      ? walletsAvailable
      : walletsAvailable.filter((wallet) =>
          ['metamask', 'keepkey', 'ledger'].includes(wallet.type.toLowerCase()),
        );

    // Retrieve and parse paired wallets
    let pairedWallets = localStorage.getItem('pairedWallets');
    if (pairedWallets) {
      pairedWallets = JSON.parse(pairedWallets).map((pw) => pw.split(':')[0].toUpperCase());
    } else {
      pairedWallets = [];
    }

    return walletsToDisplay.map((wallet) => (
      <Card key={wallet.type} onClick={() => handleWalletClick(wallet.type)}>
        <CardBody>
          <Flex align="center" direction="column" justify="center">
            <Avatar m={2} size="md" src={wallet.icon}>
              {pairedWallets.includes(wallet.type.toUpperCase()) ? (
                <AvatarBadge bg="green.500" boxSize="1em" />
              ) : (
                <AvatarBadge bg="red.500" boxSize="1em" />
              )}
            </Avatar>
            <Text fontSize="xs" textAlign="center">
              {wallet.type}
            </Text>
          </Flex>
        </CardBody>
      </Card>
    ));
  };

  const onStart = async function () {
    try {
      console.log('onStart');
      if (app && app.wallets) {
        setWalletsAvailable(app.wallets);
      }
      if (app && app.isPioneer) {
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

  const modalSelected = async function (modalType: string) {
    try {
      setModalType(modalType);
      onOpen();
    } catch (e) {
      console.error(e);
    }
  };

  const avatarContent = api ? (
    getWalletBadgeContent(walletType)
  ) : (
    <AvatarBadge bg="red.500" boxSize="1em">
      <CircularProgress isIndeterminate color="white" size="1em" />
    </AvatarBadge>
  );

  const closeModal = () => {
    onClose();
    hideModal();
  };

  return (
    <div>
      <Modal isOpen={isOpen} onClose={() => closeModal()} size="xl">
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
            {modalType === 'TRANSFER' && (
              <div>
                <Transfer openModal={openModal} />
              </div>
            )}
            {modalType === 'RECEIVE' && <div><Receive></Receive></div>}
            {modalType === 'PORTFOLIO' && <div><Portfolio></Portfolio></div>}
            {modalType === 'SWAP' && (
              <div>
                <Swap />
              </div>
            )}
            {modalType === 'SETTINGS' && <div><Settings></Settings></div>}
            {modalType === 'TREZOR' && <div>Trezor TODO</div>}
            {modalType === 'XDEFI' && <div>Xdefi TODO</div>}
            {modalType === 'ONBOARDING' && (
              <Onboarding
                onClose={onClose}
                setModalType={setModalType}
                setWalletType={setWalletType}
              />
            )}
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
        <MenuButton as={Button} cursor="pointer" minW={100} rounded="full" variant="link" >
          <Avatar size="lg">
            {isSwitchingWallet ? (
              <div>
                <Box display="inline-block" position="relative">
                  <Avatar size="lg" src={pioneerImage} />
                  <CircularProgress
                    isIndeterminate
                    color="green.500"
                    left="50%"
                    position="absolute"
                    size="1.25em"
                    top="50%"
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
              <Button
                leftIcon={getWalletContent(walletType)}
                onClick={() => handleWalletClick(walletType)}
              >
                <small>
                  <MiddleEllipsis text={context} />
                </small>
              </Button>
              <IconButton
                isRound
                aria-label="Settings"
                icon={<FaCog />}
                onClick={() => modalSelected('SETTINGS')}
              />
            </HStack>
          </Box>
          <Box
            borderRadius="md"
            borderWidth="1px"
            maxWidth="300px"
            p="4"
            textAlign="center"
            width="100%"
          >
            <Flex justify="space-around" wrap="wrap">
              {' '}
              {/* Flex container for the buttons */}
              {/* Portfolio Button */}
              <Flex align="center" direction="column" m={2}>
                <IconButton
                  aria-label="Portfolio"
                  colorScheme="green"
                  icon={<FaRegMoneyBillAlt />}
                  rounded="full"
                  size="lg"
                  variant="solid"
                  onClick={() => modalSelected('PORTFOLIO')}
                />
                <Text fontSize="xs">Portfolio</Text>
              </Flex>
              {/* Send Button */}
              <Flex align="center" direction="column" m={2}>
                <IconButton
                  aria-label="Send"
                  colorScheme="green"
                  icon={<FaPaperPlane />}
                  onClick={() => modalSelected('TRANSFER')}
                  rounded="full"
                  size="lg"
                  variant="solid"
                />
                <Text fontSize="xs">Send</Text>
              </Flex>
              {/* Receive Button */}
              <Flex align="center" direction="column" m={2}>
                <IconButton
                  aria-label="Receive"
                  colorScheme="green"
                  icon={<FaDownload />}
                  onClick={() => modalSelected('RECEIVE')}
                  rounded="full"
                  size="lg"
                  variant="solid"
                />
                <Text fontSize="xs">Receive</Text>
              </Flex>
              {/* Swap Button */}
              <Flex align="center" direction="column" m={2}>
                <IconButton
                  aria-label="Swap"
                  colorScheme="green"
                  icon={<FaExchangeAlt />}
                  onClick={() => modalSelected('SWAP')}
                  rounded="full"
                  size="lg"
                  variant="solid"
                />
                <Text fontSize="xs">Swap</Text>
              </Flex>
            </Flex>
          </Box>
          <MenuItem>
            <SimpleGrid columns={3} maxWidth="280px" row={1}>
              {renderWallets()}
              <Text color="blue.500" cursor="pointer" fontSize="sm" onClick={toggleShowAllWallets}>
                {showAllWallets ? 'Hide Wallets' : 'more'}
              </Text>
            </SimpleGrid>
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};

export default Pioneer;

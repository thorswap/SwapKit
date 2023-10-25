import { AddIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid, // Add SimpleGrid
  useDisclosure,
} from '@chakra-ui/react';
import { SwapKitApi } from '@coinmasters/api';
import { FeeOption } from '@coinmasters/types';
// import { COIN_MAP_LONG } from "@pioneer-platform/pioneer-coins";
import { useEffect, useState } from 'react';

import AssetSelect from '../../components/AssetSelect';
import OutputSelect from '../../components/OutputSelect';
import SignTransaction from '../../components/SignTransaction';
import { usePioneer } from '../../context/Pioneer';

// import backgroundImage from "lib/assets/background/thorfox.webp"; // Adjust the path
// import ForkMeBanner from "lib/components/ForkMe";
import BeginSwap from './steps/BeginSwap'; // Updated import here
import CompleteSwap from './steps/CompleteSwap'; // Updated import here
import SelectAssets from './steps/SelectAssets';

const Home = () => {
  const { state, onStart } = usePioneer();
  const { app, assetContext, outboundAssetContext, blockchainContext } = state;
  // steps
  const [step, setStep] = useState(0);
  const [modalType, setModalType] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [route, setRoute] = useState(null);
  const [quoteId, setQuoteId] = useState('');
  const [txHash, setTxhash] = useState(null);
  const [inputAmount, setInputAmount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0); // New state for current route index

  const [selectedButton, setSelectedButton] = useState('quick'); // Initial selected button is "Quick"
  const [isContinueDisabled, setIsContinueDisabled] = useState(true); // Initial continue button is disabled
  const handleClick = (button: any) => {
    setSelectedButton(button);
  };
  const [continueButtonContent, setContinueButtonContent] = useState('Continue'); // Initial continue button content is "Continue"
  // const [assets] = useState([]); // Array to store assets
  const [showGoBack, setShowGoBack] = useState(false);

  useEffect(() => {
    if (app && app.swapKit && assetContext && outboundAssetContext && step === 0) {
      setIsContinueDisabled(false);
    }
  }, [app, assetContext, blockchainContext, outboundAssetContext, step]);

  useEffect(() => {
    if (step === 0) {
      setShowGoBack(false);
    }
    if (step === 1) {
      setContinueButtonContent('Accept Route');
    }
  }, [step]);

  //start the context provider
  useEffect(() => {
    onStart();
  }, []);

  const openModal = (type: any) => {
    setModalType(type);
    onOpen();
  };

  const fetchQuote = async () => {
    let amountSelect;
    if (!inputAmount || inputAmount === 0) {
      amountSelect = parseFloat(assetContext?.balance);
      setInputAmount(amountSelect);
    } else {
      amountSelect = inputAmount;
    }

    console.log('amountSelect: ', amountSelect);
    const senderAddress = app.swapKit.getAddress(assetContext.chain);
    const recipientAddress = app.swapKit.getAddress(outboundAssetContext.chain);
    try {
      const entry = {
        sellAsset: assetContext.chain + '.' + assetContext.symbol,
        sellAmount: assetContext.balance,
        buyAsset: outboundAssetContext.chain + '.' + outboundAssetContext.symbol,
        senderAddress,
        recipientAddress,
        slippage: '3',
      };
      console.log('entry: ', entry);

      const result = await SwapKitApi.getQuote(entry);
      if (result && result.routes && result.routes.length > 0) {
        setQuoteId(result?.quoteId);
        setRoutes(result?.routes);
        console.log("currentRouteIndex: ", currentRouteIndex)
        setRoute(result?.routes[currentRouteIndex || 0]);
      }
    } catch (e: any) {
      console.error('ERROR: ', e);
      // alert(`Failed to get quote! ${e.message}`);
    }
  };

  const handleClickContinue = () => {
    try {
      if (step === 0) {
        fetchQuote();
        setStep((prevStep) => prevStep + 1);
        setShowGoBack(true);
        return;
      }
      if (step === 1) {
        const swapParams = {
          recipient: assetContext.address,
          feeOptionKey: FeeOption.Fast,
        };
        console.log('swapParams: ', swapParams);
        fetchQuote();
        // console.log("swapKit: ", swapKit);
        openModal('Confirm Trade');
        // const txHash = await swapKit.swap(swapParams);
        // console.log('txHash: ', txHash);
        // setTxhash(txHash);
        // setStep((prevStep) => prevStep + 1);
      }
      if (step === 1) {
        // check if confirmed
        // if confirmed
        // setStep((prevStep) => prevStep + 1)
      }
    } catch (e) {
      console.error(e);
    }
  };

  //start the context provider
  useEffect(() => {
    if (step === 1 && txHash) {
      setShowGoBack(false);
      // check if confirmed
      // if confirmed
      setStep((prevStep) => prevStep + 1);
    }
  }, [txHash]);

  const goBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <SelectAssets
            handleClick={handleClick}
            openModal={openModal}
            selectedButton={selectedButton}
          />
        );
      case 1:
        return (
          <BeginSwap
            routes={routes}
            inputAmount={inputAmount}
            setInputAmount={setInputAmount}
            setRoute={setRoute}
            currentRouteIndex={currentRouteIndex}
            setCurrentRouteIndex={setCurrentRouteIndex}
          />
        );
      case 2:
        return <CompleteSwap quoteId={quoteId} route={route} txHash={txHash} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* <ForkMeBanner /> */}
      <Modal isOpen={isOpen} onClose={() => onClose()} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Render content based on modalType */}
            {modalType === 'Select Asset' && (
              <div>
                <AssetSelect onClose={onClose} />
              </div>
            )}
            {modalType === 'Select Outbound' && (
              <div>
                <OutputSelect onClose={onClose} onlyOwned={false} />
              </div>
            )}
            {modalType === 'Confirm Trade' && (
              <div>
                <SignTransaction
                  inputAmount={inputAmount}
                  onClose={onClose}
                  route={route}
                  setTxhash={setTxhash}
                  currentRouteIndex={currentRouteIndex}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box
        bg="black"
        borderRadius="1.37rem 1.37rem 0 0"
        boxShadow="rgb(0 0 0 / 8%) 0rem 0.37rem 0.62rem"
        mt="5rem"
        mx="auto"
        w="35rem"
      >
        <Flex
          alignItems="center"
          color="rgb(86, 90, 105)"
          justifyContent="space-between"
          p="1rem 1.25rem 0.5rem"
        >
          <h1>Swap</h1>
          {quoteId && <div>{quoteId}</div>}
          <SettingsIcon
            _hover={{ color: 'rgb(128,128,128)' }}
            cursor="pointer"
            fontSize="1.25rem"
            onClick={() => openModal('settings')}
          />
        </Flex>
        {renderStepContent()}
      </Box>
      <Flex alignItems="center" bg="black" flexDirection="column" mx="auto" p="2rem" w="35rem">
        <SimpleGrid columns={2} mb={4} spacing={4} width="full">
          {/* {assets.map((asset: any) => ( */}
          {/*  <Button */}
          {/*    key={asset.network} */}
          {/*    onClick={() => setSelectedButton(asset.network)} */}
          {/*    colorScheme={selectedButton === asset.network ? "blue" : "gray"} */}
          {/*    variant={selectedButton === asset.network ? "solid" : "outline"} */}
          {/*    width="100%" */}
          {/*  > */}
          {/*    {asset.network} */}
          {/*  </Button> */}
          {/* ))} */}
        </SimpleGrid>
        <Button
          colorScheme="blue"
          isDisabled={isContinueDisabled}
          leftIcon={<AddIcon />}
          mt={4}
          onClick={() => handleClickContinue()}
        >
          {continueButtonContent}
        </Button>
        {showGoBack ? (
          <div>
            <Button onClick={goBack}>Go Back</Button>
          </div>
        ) : (
          <div />
        )}
      </Flex>
    </Box>
  );
};

export default Home;

/*
    Pioneer Template
 */

import {
  Button,
  useDisclosure,
  Modal,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { useEffect, useState } from 'react';

import AssetSelect from '../../components/AssetSelect';
import { usePioneer } from '../../context/Pioneer';

// import OutputSelect from "lib/components/OutputSelect";
// import BlockchainSelect from "lib/components/BlockchainSelect";
// import WalletSelect from "lib/components/WalletSelect";
import Basic from '../../components/Basic';
// // import Pubkeys from "./components/Pubkeys";
import Transfer from '../../components/Transfer';
// import Swap from "./components/Swap";

const Home = () => {
  const { state, onStart } = usePioneer();
  const {
    // api,
    // app,
    // context,
    // assetContext,
    // blockchainContext,
    pubkeyContext,
    // modals,
  } = state;
  const [address, setAddress] = useState('');
  const [modalType, setModalType] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // start the context provider
  useEffect(() => {
    // if(txid){
    //   //set the txid
    //   // @ts-ignore
    //   setTxhash(txid);
    //   setStep(2);
    // }
    onStart();
  }, []);

  useEffect(() => {
    if (pubkeyContext)
      setAddress(
        pubkeyContext?.master || pubkeyContext?.pubkey || pubkeyContext
      );
  }, [pubkeyContext]);

  const openModal = (type: any) => {
    setModalType(type);
    onOpen();
  };

  return (
    <div>
      <Modal isOpen={isOpen} onClose={() => onClose()} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalType}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Render content based on modalType */}
            {/* {modalType === "Select wallet" && ( */}
            {/*  <div> */}
            {/*    <WalletSelect onClose={onClose}></WalletSelect> */}
            {/*  </div> */}
            {/* )} */}
            {modalType === 'Select Asset' && (
              <div>
                <AssetSelect onClose={onClose} onlyOwned />
              </div>
            )}
            {/* {modalType === "Select Blockchain" && ( */}
            {/*  <div> */}
            {/*    <BlockchainSelect onClose={onClose}></BlockchainSelect> */}
            {/*  </div> */}
            {/* )} */}
            {/* {modalType === "View Address" && ( */}
            {/*  <div> */}
            {/*    {JSON.stringify(pubkeyContext)} address: {address} */}
            {/*  </div> */}
            {/* )} */}
            {/* {modalType === "Select Outbound" && ( */}
            {/*  <div> */}
            {/*    <OutputSelect onClose={onClose} onlyOwned={false}></OutputSelect> */}
            {/*  </div> */}
            {/* )} */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {address}
      <Tabs>
        <TabList>
          <Tab>Context</Tab>
          <Tab>balances</Tab>
          <Tab>Transfer</Tab>
          <Tab>Swaps</Tab>
          <Tab>Earn</Tab>
          <Tab>Borrow</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Basic />
          </TabPanel>
          <TabPanel>
            <AssetSelect />
          </TabPanel>
          <TabPanel>
            <Transfer openModal={openModal} />
          </TabPanel>
          <TabPanel>{/* <Swap openModal={openModal}></Swap> */}</TabPanel>
          <TabPanel>
            <p>Earn</p>
          </TabPanel>
          <TabPanel>
            <p>Borrow</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default Home;

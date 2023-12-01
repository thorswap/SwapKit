/*
    Pioneer Template
 */

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import AssetSelect from '../../components/AssetSelect';
import Basic from '../../components/Basic';
// import OutputSelect from "lib/components/OutputSelect";
// import BlockchainSelect from "lib/components/BlockchainSelect";
// import WalletSelect from "lib/components/WalletSelect";
import Onboarding from '../../components/Onboarding';
import Pubkeys from '../../components/Pubkeys';
import Transfer from '../../components/Transfer';
import { usePioneer } from '../../context/Pioneer';
import Swap from "../../components/Swap";
import Loan from "../../components/Loan";
import Earn from "../../components/Earn";

const Home = () => {
  const { state, onStart } = usePioneer();
  const {
    pubkeyContext,
    balances,
  } = state;
  const [address, setAddress] = useState('');
  const [modalType, setModalType] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (pubkeyContext) setAddress(pubkeyContext?.master || pubkeyContext?.pubkey || pubkeyContext);
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
                <AssetSelect onlyOwned onClose={onClose} />
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
          <Tab>pubkeys</Tab>
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
            Pubkeys
            <Pubkeys />
          </TabPanel>
          <TabPanel>
            <AssetSelect />
          </TabPanel>
          <TabPanel>
            <Transfer openModal={openModal} />
          </TabPanel>
          <TabPanel><Swap></Swap></TabPanel>
          <TabPanel>
            <Earn></Earn>
          </TabPanel>
          <TabPanel>
            <Loan></Loan>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default Home;

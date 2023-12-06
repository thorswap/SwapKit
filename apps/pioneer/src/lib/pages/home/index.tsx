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
import Balances from '../../components/Balances';
import Blockchains from '../../components/Blockchains';
import Earn from '../../components/Earn';
import Loan from '../../components/Loan';
import Paths from '../../components/Paths';
import Pubkeys from '../../components/Pubkeys';
import Swap from '../../components/Swap';
import Transfer from '../../components/Transfer';
import { usePioneer } from '../../context/Pioneer';

const Home = () => {
  const { state, onStart } = usePioneer();
  const { pubkeyContext, balances } = state;
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

  const onSelect = (asset: any) => {
    //select asset
    console.log('asset: ', asset);
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
          <Tab>blockchains</Tab>
          <Tab>paths</Tab>
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
            <Blockchains />
          </TabPanel>
          <TabPanel>
            <Paths />
          </TabPanel>
          <TabPanel>
            <Pubkeys />
          </TabPanel>
          <TabPanel>
            <Balances onSelect={onSelect} />
          </TabPanel>
          <TabPanel>
            <Transfer openModal={openModal} />
          </TabPanel>
          <TabPanel>
            <Swap />
          </TabPanel>
          <TabPanel>
            <Earn />
          </TabPanel>
          <TabPanel>
            <Loan />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default Home;

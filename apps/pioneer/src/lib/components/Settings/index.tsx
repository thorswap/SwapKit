import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Flex,
  Avatar,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { usePioneer } from '../../context/Pioneer';
import Path from '../../components/Path';
import Basic from '..//Basic';
import Blockchains from '../Blockchains';

export default function Settings({ onClose }) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');

  useEffect(() => {
    if (app?.blockchains) {
      console.log('app?.blockchains: ', app?.blockchains);
    }
  }, [app, app?.blockchains]);

  const handlePubkeyClick = (pubkey) => {
    setSelectedPubkey(pubkey);
    onOpen();
  };

  const handleCopy = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(''), 3000);
  };

  return (
    <div>
      <Tabs>
        <TabList>
          <Tab>Context</Tab>
          <Tab>blockchains</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Basic />
          </TabPanel>
          <TabPanel>
            <Blockchains />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pubkey Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPubkey && <Path path={selectedPubkey} onClose={onModalClose} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}

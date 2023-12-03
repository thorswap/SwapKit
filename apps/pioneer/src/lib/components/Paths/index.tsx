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
  IconButton,
  Card,
  useClipboard,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { usePioneer } from '../../context/Pioneer';
import Path from '../../components/Path';
// import { getWalletContent } from '../../components/WalletIcon';
import {
  addressNListToBIP32,
} from '@pioneer-platform/pioneer-coins'

export default function Paths({ onClose }) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');

  useEffect(() => {
    if (app?.paths) {
      console.log('app?.paths: ', app);
      console.log('app?.paths: ', app?.paths);
    }
  }, [app, app?.paths]);

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
      {app?.paths?.map((key, index) => (
        <Card key={index} p={4} borderWidth="1px" borderRadius="lg" alignItems="center" justifyContent="space-between">
          <Box>
            <Text fontWeight="bold">{key.network}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">{key.symbol}: {key.type}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">{key.note}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">{addressNListToBIP32(key.addressNList)}</Text>
          </Box>
          <Flex alignItems="center">
            <IconButton
              icon={copiedAddress === key.address ? <CheckIcon /> : <CopyIcon />}
              onClick={() => handleCopy(key.address)}
              aria-label="Copy address"
              mr={2}
            />
            <Button onClick={() => handlePubkeyClick(key)}>Select</Button>
          </Flex>
        </Card>
      ))}

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

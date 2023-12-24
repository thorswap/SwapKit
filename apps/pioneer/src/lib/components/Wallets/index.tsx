import React, { useEffect } from 'react';
import { Box, Stack, Avatar, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { usePioneer } from '../../context/Pioneer';

export default function Pubkey({ onClose, pubkey }: any) {
  const { state } = usePioneer();
  const { app } = state;

  let onStart = async function(){
    try{
      localStorage.getItem('pairedWallets')
      console.log('app?.pubkeys: ', app?.pubkeys);

    }catch(e){

    }
  }

  return (
    <Stack>

    </Stack>
  );
}

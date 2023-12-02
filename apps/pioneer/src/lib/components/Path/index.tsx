import React, { useEffect } from 'react';
import { Box, Stack, Avatar, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { usePioneer } from '../../context/Pioneer';

export default function Path({ onClose, pubkey }: any) {
  const { state } = usePioneer();
  const { app } = state;

  useEffect(() => {
    if (app?.pubkeys) {
      console.log('app?.pubkeys: ', app?.pubkeys);
    }
  }, [app, app?.pubkeys]);

  // Checking if pubkey is already an object, if not, parse it.
  const data = (typeof pubkey === 'object' && pubkey !== null) ? pubkey : JSON.parse(pubkey || '{}');

  return (
    <Stack>
      <Box>
        <Avatar size="xl" name="Placeholder Icon" /> {/* Placeholder for avatar icon */}
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(data).map(([key, value]) => (
            <Tr key={key}>
              <Td>{key}</Td>
              <Td>{value}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
}

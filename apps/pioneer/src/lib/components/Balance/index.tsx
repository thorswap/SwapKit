import React, { useEffect } from 'react';
import { Box, Stack, Avatar, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { usePioneer } from '../../context/Pioneer';

export default function Balance({ onClose, balance }: any) {
  const { state } = usePioneer();
  const { app } = state;

  // Checking if pubkey is already an object, if not, parse it.
  const data = (typeof balance === 'object' && balance !== null) ? balance : JSON.parse(balance || '{}');

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

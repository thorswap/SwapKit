import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { usePioneer } from '../../context';

const Basic = () => {
  const { state, showModal } = usePioneer();
  const { app, context, assetContext } = state;
  const [pioneerUrl, setPioneerUrl] = useState('Copy');
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  // Variable to store the timeout ID
  let timeoutId: any = null;

  const copyToClipboard = (text: any) => {
    navigator.clipboard.writeText(text);
    setCopyButtonText('Copied to Clipboard');

    // Clear any existing timeout to avoid multiple timeouts running
    if (timeoutId) clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(() => {
      setCopyButtonText('Copy');
    }, 2000);
  };

  useEffect(() => {
    let pioneerUrlLocal = localStorage.getItem('pioneerUrl');
    setPioneerUrl(pioneerUrlLocal || '');
    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Context</Th>
              <Th>Value</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>Server</Td>
              <Td>{pioneerUrl}</Td>
              <Td>
                <Button onClick={() => showModal('ONBOARDING')} size="sm">
                  edit
                </Button>
              </Td>
            </Tr>
            <Tr>
              <Td>Username</Td>
              <Td>{app?.username}</Td>
              <Td />
            </Tr>
            <Tr>
              <Td>QueryKey</Td>
              <Td>{app?.queryKey}</Td>
              <Td />
            </Tr>
            <Tr>
              <Td>Asset Context</Td>
              <Td>{assetContext?.caip || 'no wallets paired!'}</Td>
              <Td />
            </Tr>
            <Tr>
              <Td>Address for context</Td>
              <Td>{assetContext?.address || 'no wallets paired!'}</Td>
              <Td>
                <Button onClick={() => copyToClipboard(assetContext.address)} size="sm">
                  {copyButtonText}
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Basic;

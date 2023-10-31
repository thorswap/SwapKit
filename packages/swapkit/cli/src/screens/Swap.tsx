import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import React, { useState } from 'react';

const Swap = () => {
  //const { setNavigation } = useContext(NavigationContext);

  const [query, setQuery] = useState('');

  //const { swapkit } = useContext(SwapKitContext);

  // const handleSelect = (item: any) => {
  //   setNavigation(item.value);
  // };

  return (
    <>
      <Text bold color="magenta">
        Swap
      </Text>
      <Box flexDirection="column">
        <Text>Swap</Text>
        <TextInput focus onChange={setQuery} value={query} />
      </Box>
    </>
  );
};

export default Swap;

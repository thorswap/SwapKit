import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { PioneerProvider } from './lib/context/Pioneer';
import Layout from './lib/layout';
import Routings from './lib/router/Routings';
import { theme } from './lib/styles/theme';

const App = () => (
  <PioneerProvider>
    <ChakraProvider theme={theme}>
      <Router>
        <Layout>
          <Routings />
        </Layout>
      </Router>
    </ChakraProvider>
  </PioneerProvider>
);

export default App;

import { ChakraProvider, useColorMode } from "@chakra-ui/react";
import type React from "react";
import { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { PioneerProvider } from "./lib/context/Pioneer";
import Layout from "./lib/layout";
import Routings from "./lib/router/Routings";
import { theme } from "./lib/styles/theme";

const ForceDarkMode = ({ children }: { children: React.ReactNode }) => {
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode("dark");
  }, [setColorMode]);

  return children;
};

const App = () => (
  <PioneerProvider>
    <ChakraProvider theme={theme}>
      <ForceDarkMode>
        <Router>
          <Layout>
            <Routings />
          </Layout>
        </Router>
      </ForceDarkMode>
    </ChakraProvider>
  </PioneerProvider>
);

export default App;

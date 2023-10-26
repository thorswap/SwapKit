import { extendTheme } from '@chakra-ui/react'; // Adjust the path

import { config } from './config';

export const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  fonts: {
    heading: 'Plus Jakarta Sans, sans-serif',
    body: 'Plus Jakarta Sans, sans-serif',
  },
  components: {
    Drawer: {
      // Add styles for the Drawer component
      baseStyle: {
        content: {
          bg: 'black', // Set the background color of the drawer to black
          color: 'white',
        },
      },
    },
  },
  styles: {
    global: () => ({}),
  },
  config,
});

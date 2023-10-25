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
    global: () => ({
      body: {
        backgroundColor: 'black',
        color: 'white',
      },
      p: {
      },

      heading: {
        fontSize: '75px',
      },

      // Style for Webkit scrollbars
      '::-webkit-scrollbar': {
        width: '4px',
      },
      '::-webkit-scrollbar-track': {
        backgroundColor: 'black',
      },
      '::-webkit-scrollbar-thumb': {
        backgroundColor: 'limegreen',
        borderRadius: '0px',
      },
      // Style for Firefox scrollbars
      scrollbarWidth: 'thin',
      scrollbarColor: 'limegreen black',
    }),
  },
  config,
});

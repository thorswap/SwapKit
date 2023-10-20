import { extendTheme } from "@chakra-ui/react"; // Adjust the path

import { config } from "./config";

export const theme = extendTheme({
  initialColorMode: "dark",
  useSystemColorMode: false,
  fonts: {
    heading: "Plus Jakarta Sans, sans-serif",
    body: "Plus Jakarta Sans, sans-serif",
  },
  components: {},
  config,
});

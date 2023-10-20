import { Box, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Footer from "./Footer";
import Header from "./Header";
import Meta from "./Meta";

type LayoutProps = {
  children: ReactNode;
};

// eslint-disable-next-line import/no-absolute-path
const backgroundImage = "/assets/background/thorfox.webp"; // Updated import here

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box
      bgImage={`url(${backgroundImage})`}
      bgRepeat="no-repeat" // This ensures the image doesn't repeat
      bgSize="cover" // This will cover the entire viewport
      bgPosition="center" // Centers the image
      margin="0 auto"
      transition="transform 0.3s" // Smooth transition
      _hover={{
        transform: "scale(1.05)", // Zooms the image slightly on hover
      }}
      minHeight="100vh" // This ensures the box is at least the full height of the viewport
      height="100%" // This ensures it stretches if content is more than viewport height
    >
      <Meta />
      <Flex wrap="wrap" margin="8" minHeight="90vh">
        <Header />
        <Box width="full" as="main" marginY={22}>
          {children}
        </Box>
        <Footer />
      </Flex>
    </Box>
  );
};

export default Layout;

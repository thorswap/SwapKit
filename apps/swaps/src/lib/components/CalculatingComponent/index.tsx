/*
      CalculatingComponent
 */

import { Text, useBreakpointValue, Center } from "@chakra-ui/react";

// @ts-ignore
import calculatingAnimation from "../../assets/gif/calculating.gif";

function CalculatingComponent() {
  // Adjust image size based on breakpoint
  const imageSize = useBreakpointValue({
    base: "50%",
    sm: "60%",
    md: "70%",
    lg: "80%",
    xl: "800px", // This will cap the size at 800px for larger screens
  });

  return (
    <Center
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      flexDirection="column"
      width="100%"
      maxWidth="md" // You can adjust this to set the maximum width of the card
      m="auto" // center the card horizontally
    >
      <Text fontSize="lg" mb={4} textAlign="center">
        Calculating Best Route...
      </Text>

      <img src={calculatingAnimation} alt="calculating" width={imageSize} />
    </Center>
  );
}

export default CalculatingComponent;

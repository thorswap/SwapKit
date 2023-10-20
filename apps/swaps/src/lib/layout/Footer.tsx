import { Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex
      as="footer"
      width="full"
      align="center"
      alignSelf="flex-end"
      justifyContent="center"
    >
      <Text fontSize="xs">
        {new Date().getFullYear()} -{" "}
        <Link href="https://pioneers.dev" isExternal>
          <small>build by the CoinMasters Guild</small>
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;

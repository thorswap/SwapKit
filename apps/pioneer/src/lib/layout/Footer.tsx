import { Flex, Link, Text } from '@chakra-ui/react';
import ThemeToggle from './ThemeToggle';

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
        {new Date().getFullYear()} -{' '}
        <Link href="https://pioneers.dev" isExternal>
          Pioneers.dev
        </Link>
        <br />
        <ThemeToggle />
      </Text>
    </Flex>
  );
};

export default Footer;

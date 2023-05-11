require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.18',
  networks: {
    hardhat: {
      forking: {
        url: 'https://mainnet.infura.io/v3/ed7bab7495044d8b873b9307a8d62390',
      },
    },
  },
};

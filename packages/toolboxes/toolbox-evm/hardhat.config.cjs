require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.18',
  networks: {
    hardhat: {
      forking: {
        url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY || '',
      },
    },
  },
};

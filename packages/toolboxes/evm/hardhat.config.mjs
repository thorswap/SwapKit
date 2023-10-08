import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ethers';

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: '0.8.19',
  networks: {
    hardhat: {
      forking: {
        url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_API_KEY || '',
      },
    },
  },
};

export default config;

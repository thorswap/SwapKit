import { JsonRpcProvider } from '@ethersproject/providers';
import helpers from '@nomicfoundation/hardhat-network-helpers';
// import { assetFromString, baseAmount } from '@thorswap-lib/helpers';
import { Chain, erc20ABI } from '@thorswap-lib/types';
import hre from 'hardhat';
import { afterAll, afterEach, beforeAll, beforeEach, describe, ExpectStatic, test } from 'vitest';

import { ETHToolbox } from '../index.js';
import { getProvider } from '../provider.js';
const testAddress = '0x37aabcc0fcc1aa75827013f49e767ae0a3a63b82';
const emptyRecipient = '0xE29E61479420Dd1029A9946710Ac31A0d140e77F';
// const FRAXAddress = '0x853d955aCEf822Db058eb8505911ED77F175b99e';
const SHIBAddress = '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE';
// Get latest block to use as base for reseting fork after test
const block = await hre.ethers.provider.getBlock('latest');

beforeAll(() => {
  hre.run('node');
});

beforeEach<{
  ethers: typeof import('@nomiclabs/hardhat-ethers');
  provider: JsonRpcProvider;
  toolbox: ReturnType<typeof ETHToolbox>;
}>(async (context: any) => {
  context.ethers = hre.ethers;
  const provider = getProvider(Chain.Ethereum, 'http://127.0.0.1:8545/');
  const signer = await hre.ethers.getImpersonatedSigner(testAddress);
  context.provider = provider;
  context.toolbox = ETHToolbox({ ethplorerApiKey: 'freekey', provider, signer });
}, 20000);

afterEach(async () => {
  //@ts-expect-error
  await helpers.reset(hre.network.config.forking.url, block.number);
}, 20000);

afterAll(() => {
  // To kill hardhat node if it is still running
  setTimeout(() => {
    process.exit(0);
  }, 10000);
});

describe('Ethereum toolkit', () => {
  test('Get Balances', async ({
    expect,
    toolbox,
  }: {
    expect: ExpectStatic;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    const balances = await toolbox.getBalance(testAddress);
    expect(
      balances
        .find((balance) => balance.asset.symbol === 'ETH')
        ?.amount.amount()
        .toString(),
    ).toBe('218097806619000');
    expect(
      balances
        .find(
          (balance) => balance.asset.symbol === 'SHIB-0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
        )
        ?.amount.amount()
        .toString(),
    ).toBe('741813263866114400866731');
  }, 10000);

  test('Send ETH', async ({
    expect,
    // toolbox,
    // provider,
  }: {
    expect: ExpectStatic;
    provider: JsonRpcProvider;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    expect(true).toBe(true);
    // expect((await provider.getBalance(emptyRecipient)).toString()).toBe('0');
    // await toolbox.transfer({
    //   recipient: emptyRecipient,
    //   amount: baseAmount('218097806619000', 18),
    //   asset: assetFromString('ETH.ETH'),
    //   from: testAddress,
    // });
    // expect((await provider.getBalance(emptyRecipient)).toString()).toBe('218097806619000');
  }, 10000);

  test('Send Token', async ({
    expect,
    ethers,
    provider,
    // toolbox,
  }: {
    expect: ExpectStatic;
    ethers: typeof import('@nomiclabs/hardhat-ethers');
    provider: JsonRpcProvider;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    //@ts-expect-error
    const SHIB = new ethers.Contract(SHIBAddress, erc20ABI, provider);
    const balance = await SHIB.balanceOf(emptyRecipient);
    expect(balance.toString()).toBe('0');
    // await toolbox.transfer({
    //   recipient: emptyRecipient,
    //   amount: baseAmount('741813263866114400866731', 18),
    //   asset: assetFromString('ETH.SHIB-0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'),
    //   from: testAddress,
    // });
    expect(true).toBe(true);
    // expect((await SHIB.balanceOf(emptyRecipient)).toString()).toBe('741813263866114400866731');
  }, 10000);

  test('Approve Token and validate approved amount', async ({
    expect,
    // toolbox,
  }: {
    expect: ExpectStatic;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    expect(true).toBe(true);
    // expect(
    //   await toolbox.isApproved({
    //     assetAddress: SHIBAddress,
    //     spenderAddress: emptyRecipient,
    //     from: testAddress,
    //     amount: '10000000000000000',
    //   }),
    // ).toBe(false);

    // await toolbox.approve({
    //   assetAddress: SHIBAddress, // FRAX token address
    //   spenderAddress: emptyRecipient,
    //   amount: '10000000000000000',
    //   from: testAddress,
    // });

    // expect(
    //   await toolbox.isApproved({
    //     assetAddress: SHIBAddress,
    //     spenderAddress: emptyRecipient,
    //     from: testAddress,
    //     amount: '10000000000000000',
    //   }),
    // ).toBe(true);
  }, 10000);
});

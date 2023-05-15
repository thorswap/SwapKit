import { JsonRpcProvider } from '@ethersproject/providers';
import helpers from '@nomicfoundation/hardhat-network-helpers';
import { assetFromString, baseAmount } from '@thorswap-lib/helpers';
import { Chain, erc20ABI } from '@thorswap-lib/types';
import hre from 'hardhat';
import { afterAll, afterEach, beforeAll, beforeEach, describe, ExpectStatic, test } from 'vitest';

import { ETHToolbox } from '../index.js';
import { getProvider } from '../provider.js';
const testAddress = '0x37aabcc0fcc1aa75827013f49e767ae0a3a63b82';
const emptyRecipient = '0xE29E61479420Dd1029A9946710Ac31A0d140e77F';
const FRAXAddress = '0x853d955aCEf822Db058eb8505911ED77F175b99e';
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
  const provider = await getProvider(Chain.Ethereum, 'http://127.0.0.1:8545/');
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
    ).toBe('100000000000000000');
    expect(
      balances
        .find(
          (balance) => balance.asset.symbol === 'FRAX-0x853d955aCEf822Db058eb8505911ED77F175b99e',
        )
        ?.amount.amount()
        .toString(),
    ).toBe('67099626015485073783');
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
    toolbox,
    provider,
  }: {
    expect: ExpectStatic;
    provider: JsonRpcProvider;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    expect((await provider.getBalance(emptyRecipient)).toString()).toBe('0');
    await toolbox.transfer({
      recipient: emptyRecipient,
      amount: baseAmount('10000000000000000', 18),
      asset: assetFromString('ETH.ETH'),
      from: testAddress,
    });
    expect((await provider.getBalance(emptyRecipient)).toString()).toBe('10000000000000000');
  }, 10000);

  test('Send Token', async ({
    expect,
    ethers,
    provider,
    toolbox,
  }: {
    expect: ExpectStatic;
    ethers: typeof import('@nomiclabs/hardhat-ethers');
    provider: JsonRpcProvider;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    //@ts-expect-error
    const FRAX = new ethers.Contract(FRAXAddress, erc20ABI, provider);
    const balance = await FRAX.balanceOf(emptyRecipient);
    expect(balance.toString()).toBe('0');
    await toolbox.transfer({
      recipient: emptyRecipient,
      amount: baseAmount('10000000000000000', 18),
      asset: assetFromString('ETH.FRAX-0x853d955aCEf822Db058eb8505911ED77F175b99e'),
      from: testAddress,
    });

    expect((await FRAX.balanceOf(emptyRecipient)).toString()).toBe('10000000000000000');
  }, 10000);

  test('Approve Token and validate approved amount', async ({
    expect,
    toolbox,
  }: {
    expect: ExpectStatic;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    expect(
      await toolbox.isApproved({
        assetAddress: FRAXAddress,
        spenderAddress: emptyRecipient,
        from: testAddress,
        amount: '10000000000000000',
      }),
    ).toBe(false);

    await toolbox.approve({
      assetAddress: FRAXAddress, // FRAX token address
      spenderAddress: emptyRecipient,
      amount: '10000000000000000',
      from: testAddress,
    });

    expect(
      await toolbox.isApproved({
        assetAddress: FRAXAddress,
        spenderAddress: emptyRecipient,
        from: testAddress,
        amount: '10000000000000000',
      }),
    ).toBe(true);
  }, 10000);
});

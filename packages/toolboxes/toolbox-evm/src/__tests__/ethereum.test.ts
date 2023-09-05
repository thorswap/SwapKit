import { BigNumber } from '@ethersproject/bignumber';
import type { JsonRpcProvider } from '@ethersproject/providers';
import helpers from '@nomicfoundation/hardhat-network-helpers';
import type ethers from '@nomiclabs/hardhat-ethers';
import { assetFromString, baseAmount } from '@thorswap-lib/helpers';
import { Chain, erc20ABI, FeeOption } from '@thorswap-lib/types';
import hre from 'hardhat';
import type { ExpectStatic } from 'vitest';
import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from 'vitest';

import { ETHToolbox } from '../index.ts';
import { getProvider } from '../provider.ts';
const testAddress = '0x6d6e022eE439C8aB8B7a7dBb0576f8090319CDc6';
const emptyRecipient = '0xE29E61479420Dd1029A9946710Ac31A0d140e77F';
const USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// Get latest block to use as base for reseting fork after test
const block = await hre.ethers.provider.getBlock('latest');

beforeAll(() => {
  hre.run('node');
});

beforeEach<{
  ethers: typeof ethers;
  provider: JsonRpcProvider;
  toolbox: ReturnType<typeof ETHToolbox>;
}>(async (context: any) => {
  context.ethers = hre.ethers;
  const provider = getProvider(Chain.Ethereum, 'http://127.0.0.1:8545/');
  context.provider = provider;
  const signer = await hre.ethers.getImpersonatedSigner(testAddress);
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
    ).toBe('20526000000000000');
    expect(
      balances
        .find(
          (balance) => balance.asset.symbol === 'USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        )
        ?.amount.amount()
        .toString(),
    ).toBe('6656178');
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
      amount: baseAmount('10526000000000000', 18),
      asset: assetFromString('ETH.ETH'),
      from: testAddress,
    });
    expect((await provider.getBalance(emptyRecipient)).toString()).toBe('10526000000000000');
  }, 10000);

  test('Send Token', async ({
    expect,
    provider,
    toolbox,
  }: {
    expect: ExpectStatic;
    provider: JsonRpcProvider;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    const USDC = toolbox.createContract(USDCAddress, erc20ABI, provider);
    const balance = await USDC.balanceOf(emptyRecipient);
    expect(balance.toString()).toBe('0');
    await toolbox.transfer({
      recipient: emptyRecipient,
      amount: baseAmount('1000000', 6),
      asset: assetFromString('ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
      from: testAddress,
    });
    expect((await USDC.balanceOf(emptyRecipient)).toString()).toBe('1000000');
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
        assetAddress: USDCAddress,
        spenderAddress: emptyRecipient,
        from: testAddress,
        amount: '1000000',
      }),
    ).toBe(false);
    await toolbox.approve({
      assetAddress: USDCAddress,
      spenderAddress: emptyRecipient,
      amount: '1000000',
      from: testAddress,
    });

    expect(
      await toolbox.isApproved({
        assetAddress: USDCAddress,
        spenderAddress: emptyRecipient,
        from: testAddress,
        amount: '1000000',
      }),
    ).toBe(true);
  }, 10000);
  test('Create contract tx object and sendTransaction', async ({
    expect,
    provider,
    toolbox,
  }: {
    expect: ExpectStatic;
    provider: JsonRpcProvider;
    toolbox: ReturnType<typeof ETHToolbox>;
  }) => {
    const USDC = toolbox.createContract(USDCAddress, erc20ABI, provider);
    const balance = await USDC.balanceOf(emptyRecipient);
    expect(balance.toString()).toBe('0');

    const txObject = await toolbox.createContractTxObject({
      contractAddress: USDCAddress,
      abi: erc20ABI,
      funcName: 'transfer',
      funcParams: [emptyRecipient, BigNumber.from('2222222')],
      txOverrides: {
        from: testAddress,
      },
    });

    await toolbox.sendTransaction(txObject, FeeOption.Average);
    expect((await USDC.balanceOf(emptyRecipient)).toString()).toBe('2222222');
  }, 10000);
});

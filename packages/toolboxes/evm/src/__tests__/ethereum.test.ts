import type ethers from "@nomicfoundation/hardhat-ethers";
import helpers from "@nomicfoundation/hardhat-network-helpers";
import { AssetValue } from "@swapkit/helpers";
import { Chain, FeeOption, erc20ABI } from "@swapkit/types";
import type { JsonRpcProvider } from "ethers";
import hre from "hardhat";
import type { ExpectStatic } from "vitest";
import { afterAll, afterEach, beforeAll, beforeEach, describe, test } from "vitest";

import { ETHToolbox } from "../index.ts";
import { getProvider } from "../provider.ts";
const testAddress = "0x6d6e022eE439C8aB8B7a7dBb0576f8090319CDc6";
const emptyRecipient = "0xE29E61479420Dd1029A9946710Ac31A0d140e77F";
const USDCAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
// Get latest block to use as base for reseting fork after test
const block = await hre.ethers.provider.getBlock("latest");

beforeAll(() => {
  hre.run("node");
});

beforeEach<{
  ethers: typeof ethers;
  provider: JsonRpcProvider;
  toolbox: ReturnType<typeof ETHToolbox>;
}>(async (context: any) => {
  context.ethers = hre.artifacts;
  const provider = getProvider(Chain.Ethereum, "http://127.0.0.1:8545/");
  const signer = (await hre.ethers.getImpersonatedSigner(testAddress)) as any;
  context.provider = provider;
  context.toolbox = ETHToolbox({ ethplorerApiKey: "freekey", provider, signer });
}, 20000);

afterEach(async () => {
  await helpers.reset(hre.config.networks.hardhat.forking?.url, block?.number);
}, 20000);

afterAll(() => {
  // To kill hardhat node if it is still running
  setTimeout(() => {
    process.exit(0);
  }, 10000);
});

describe("Ethereum toolkit", () => {
  test.todo(
    "Get Balances",
    async ({
      expect,
      toolbox,
    }: {
      expect: ExpectStatic;
      toolbox: ReturnType<typeof ETHToolbox>;
    }) => {
      const balances = await toolbox.getBalance(testAddress);
      expect(balances.find((balance) => balance.symbol === "ETH")?.getBaseValue("string")).toBe(
        "20526000000000000",
      );
      expect(
        balances
          .find(
            (balance) =>
              balance.symbol.toLowerCase() ===
              "USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase(),
          )
          ?.getBaseValue("string"),
      ).toBe("6656178");
    },
    10000,
  );

  test.todo(
    "Send ETH",
    async ({
      expect,
      toolbox,
      provider,
    }: {
      expect: ExpectStatic;
      provider: JsonRpcProvider;
      toolbox: ReturnType<typeof ETHToolbox>;
    }) => {
      expect((await provider.getBalance(emptyRecipient)).toString()).toBe("0");
      await toolbox.transfer({
        recipient: emptyRecipient,
        assetValue: await AssetValue.fromIdentifier("ETH.ETH", "0.010526"),
        from: testAddress,
      });
      expect((await provider.getBalance(emptyRecipient)).toString()).toBe("10526000000000000");
    },
    10000,
  );

  test.todo(
    "Send Token",
    async ({
      expect,
      provider,
      toolbox,
    }: {
      expect: ExpectStatic;
      provider: JsonRpcProvider;
      toolbox: ReturnType<typeof ETHToolbox>;
    }) => {
      const USDC = await toolbox.createContract(USDCAddress, erc20ABI, provider);
      const balance = await USDC.balanceOf(emptyRecipient);
      expect(balance.toString()).toBe("0");
      await toolbox.transfer({
        recipient: emptyRecipient,
        assetValue: await AssetValue.fromIdentifier(
          "ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          "1",
        ),
        from: testAddress,
      });
      expect((await USDC.balanceOf(emptyRecipient)).toString()).toBe("1000000");
    },
    10000,
  );

  test.todo(
    "Approve Token and validate approved amount",
    async ({
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
          amount: "1000000",
        }),
      ).toBe(false);
      await toolbox.approve({
        assetAddress: USDCAddress,
        spenderAddress: emptyRecipient,
        amount: "1000000",
        from: testAddress,
      });

      expect(
        await toolbox.isApproved({
          assetAddress: USDCAddress,
          spenderAddress: emptyRecipient,
          from: testAddress,
          amount: "1000000",
        }),
      ).toBe(true);
    },
    10000,
  );
  test.todo(
    "Create contract tx object and sendTransaction",
    async ({
      expect,
      provider,
      toolbox,
    }: {
      expect: ExpectStatic;
      provider: JsonRpcProvider;
      toolbox: ReturnType<typeof ETHToolbox>;
    }) => {
      const USDC = await toolbox.createContract(USDCAddress, erc20ABI, provider);
      const balance = await USDC.balanceOf(emptyRecipient);
      expect(balance.toString()).toBe("0");

      const txObject = await toolbox.createContractTxObject({
        contractAddress: USDCAddress,
        abi: erc20ABI,
        funcName: "transfer",
        funcParams: [emptyRecipient, BigInt("2222222")],
        txOverrides: {
          from: testAddress,
        },
      });

      await toolbox.sendTransaction(txObject, FeeOption.Average);
      expect((await USDC.balanceOf(emptyRecipient)).toString()).toBe("2222222");
    },
    10000,
  );
});

import { derivationPathToString } from "@swapkit/helpers";
import type {
  SignerPayloadRaw,
  SignerResult,
  SwapKitSubstrateSigner,
} from "@swapkit/toolbox-substrate";
import type { DerivationPathArray } from "@swapkit/types";
import { getLedgerTransport } from "../helpers/getLedgerTransport.ts";

type PolkadotApp = {
  getAddress: (
    derivationPath: string,
    requireConfirmation?: boolean,
  ) => Promise<{ pubKey: string; address: string; return_code: number }>;
  sign: (
    derivationPath: string,
    message: string,
  ) => Promise<{
    signature: null | string;
    return_code: number;
  }>;
};

export const PolkadotLedger = (derivationPathArray: DerivationPathArray = [44, 354, 0, 0, 0]) => {
  const derivationPath = derivationPathToString(derivationPathArray);
  let app: PolkadotApp | null = null;

  async function createTransportAndLedger() {
    const transport = await getLedgerTransport();
    const { default: PolkadotApp } = await import("@ledgerhq/hw-app-polkadot");

    if (app) return app;

    // @ts-expect-error `default` typing is wrong
    app = new PolkadotApp(transport) as PolkadotApp;

    return app;
  }

  async function getAddress(requireConfirmation?: boolean) {
    const app = await createTransportAndLedger();
    const { address } = await app.getAddress(derivationPath, requireConfirmation);
    return address;
  }

  async function sign(message: string) {
    const app = await createTransportAndLedger();
    return await app.sign(derivationPath, message);
  }

  async function getAsSigner(): Promise<SwapKitSubstrateSigner> {
    const address = await getAddress();

    async function signRaw(payload: SignerPayloadRaw) {
      const { signature } = await sign(payload.data);

      if (!signature) {
        throw new Error("Ledger sign error");
      }

      return { id: 0, signature } as SignerResult;
    }

    return {
      address,
      signRaw,
    };
  }

  return {
    getAddress,
    sign,
    getAsSigner,
  };
};

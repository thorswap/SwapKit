export const PolkadotLedger = async () => {
  const { Ledger } = await import("@polkadot/hw-ledger");
  const app = new Ledger("webusb", "polkadot");

  async function getAddress() {
    return (await app.getAddress()).address;
  }

  async function signRaw(raw: any) {
    const { hexToU8a } = await import("@polkadot/util");

    const signature = await app.signRaw(hexToU8a(raw.data));

    return {
      signature: signature.signature,
      id: 0,
    };
  }

  return {
    address: await getAddress(),
    getAddress,
    signRaw,
  };
};

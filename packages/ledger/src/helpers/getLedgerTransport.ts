// @ts-ignore Ledger typing is wrong
import Transport, { getLedgerDevices } from '@ledgerhq/hw-transport-webusb';

export const getLedgerTransport = async () => {
  const [device] = await getLedgerDevices();
  if (!device) throw new Error('No Ledger device found');
  const iface = device.configurations[0].interfaces.find(({ alternates }: any) =>
    alternates.some(({ interfaceClass }: any) => interfaceClass === 255),
  );

  if (!iface) throw new Error('No Ledger device found');

  // @ts-ignore Ledger typing is wrong
  return new Transport(device, iface.interfaceNumber);
};

import { ledgerUSBVendorId } from '@ledgerhq/devices';
import Transport from '@ledgerhq/hw-transport-webusb';

declare global {
  interface Navigator {
    usb?: {
      getDevices: () => Promise<any[]>;
    };
  }
}

const getLedgerDevices = async () => {
  if (typeof navigator?.usb?.getDevices !== 'function') return [];

  const devices = await navigator?.usb?.getDevices();
  return devices.filter((d) => d.vendorId === ledgerUSBVendorId);
};

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

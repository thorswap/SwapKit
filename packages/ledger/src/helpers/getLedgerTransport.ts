import { ledgerUSBVendorId } from '@ledgerhq/devices';
import { DisconnectedDevice } from '@ledgerhq/errors';
import Transport from '@ledgerhq/hw-transport-webusb';

declare global {
  interface Navigator {
    usb?: {
      getDevices: () => Promise<any[]>;
      removeEventListener: (event: string, callback: (e: any) => void) => void;
      addEventListener: (event: string, callback: (e: any) => void) => void;
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
  await device.open();
  if (device.configuration === null) await device.selectConfiguration(1);

  try {
    await device.reset();
  } catch (err) {
    console.warn(err);
  }

  const iface = device.configurations[0].interfaces.find(({ alternates }: any) =>
    alternates.some(({ interfaceClass }: any) => interfaceClass === 255),
  );

  if (!iface) throw new Error('No Ledger device found');

  try {
    await device.claimInterface(iface.interfaceNumber);
  } catch (error: any) {
    await device.close();
    console.error(error);
    throw new Error(error.message);
  }

  // @ts-ignore Ledger typing is wrong
  const transport = new Transport(device, iface.interfaceNumber);

  const onDisconnect = (e: any) => {
    if (device === e.device) {
      navigator?.usb?.removeEventListener('disconnect', onDisconnect);

      transport._emitDisconnect(new DisconnectedDevice());
    }
  };
  navigator?.usb?.addEventListener('disconnect', onDisconnect);

  return transport;
};

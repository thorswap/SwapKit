// Import React as these functions return JSX elements
import { Avatar, AvatarBadge, Image } from '@chakra-ui/react';

// @ts-ignore
import KeepKeyImagePng from '../../assets/png/keepkey.png';
// @ts-ignore
import KeplerImagePng from '../../assets/png/keplr.png';
// @ts-ignore
import LedgerImagePng from '../../assets/png/ledger.png';
// @ts-ignore
import MetaMaskImagePng from '../../assets/png/metamask.png';
// @ts-ignore
import pioneerImagePng from '../../assets/png/pioneer.png';
// @ts-ignore
import XDEFIImagePng from '../../assets/png/XDEFI.png';
// @ts-ignore
import wcImagePng from '../../assets/svg/wc.svg';

const icons: any = {
  metamask: MetaMaskImagePng,
  keepkey: KeepKeyImagePng,
  native: pioneerImagePng,
  keplr: KeplerImagePng,
  xdefi: XDEFIImagePng,
  ledger: LedgerImagePng,
  wc: wcImagePng,
};

export const getWalletContent = (walletType: string) => {
  const icon = icons[walletType.toLowerCase()];
  return <Avatar src={icon} />;
};

export const getWalletBadgeContent = (walletType: string, size?: string) => {
  const icon = icons[walletType.toLowerCase()];

  if (!size) size = '1.25em';
  if (icon) {
    return (
      <AvatarBadge boxSize={size}>
        <Image rounded="full" src={icon} />
      </AvatarBadge>
    );
  } else {
    return <AvatarBadge bg="green.500" boxSize="1.25em" />;
  }
};

export {
  KeepKeyImagePng,
  KeplerImagePng,
  LedgerImagePng,
  MetaMaskImagePng,
  pioneerImagePng,
  wcImagePng,
  XDEFIImagePng,
};

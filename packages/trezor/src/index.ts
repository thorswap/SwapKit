import TrezorConnect from '@trezor/connect-web';

TrezorConnect.default.init({
  lazyLoad: true, // this param will prevent iframe injection until TrezorConnect.method will be called
  manifest: {
    email: 'towan@thorswap.finance',
    appUrl: 'https://app.thorswap.finance',
  },
});

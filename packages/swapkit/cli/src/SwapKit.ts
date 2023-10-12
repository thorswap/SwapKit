import { createSwapKit } from '@swapkit/sdk';

const swapkit = createSwapKit({
  config: {
    covalentApiKey: '',
    ethplorerApiKey: '',
    stagenet: true,
    trezorManifest: { email: '', appUrl: '' },
    utxoApiKey: '',
    walletConnectProjectId: '',
  },
});

export default swapkit;

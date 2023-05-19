# @thorswap-lib/swapkit-sdk

## SwapKit SDK

All-in-one SDK for SwapKit. It includes all the packages needed to use all SwapKit features.

## Install

```bash
pnpm add @thorswap-lib/swapkit-sdk
```

```tsx
import { createSwapKit, SwapKitCore } from '@thorswap-lib/swapkit-sdk';

const useSwapKitClient = () => {
  const [skClient, setSkClient] = useState<SwapKitCore | null>(null)

  useEffect(() => {
    createSwapKit().then(setSkClient)
  }, [])

  return skClient
}


const client = useSwapKitClient()
await client?.connectEVMWallet(chains, WalletOption.Metamask)
```

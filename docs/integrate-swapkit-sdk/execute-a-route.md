---
description: We allow you to execute any on-chain or cross-chain swap.
---

# 4⃣ Execute a Route

After fetching the available routes, you can execute one using `swap` as described below.

```
import { FeeOption } from '@thorswap-lib/swapkit-sdk';

const txHash = await skClient.swap({
    route,
    recipient: recipientAddress,
    feeOptionKey: FeeOption.Fast
});
```

The `skClient` used above assumes a wallet has been connected as described in [Set up the SDK](set-up-the-sdk.md).

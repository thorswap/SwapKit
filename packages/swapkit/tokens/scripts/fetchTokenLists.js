import { SwapKitApi } from '@thorswap-lib/swapkit-api';
import fs from 'fs-extra';

const getTokens = async () => {
  const providers = (await SwapKitApi.getTokenlistProviders()).map(({ provider }) => provider);

  console.info({ providers });
  providers.forEach(async (provider) => {
    const tokenList = await SwapKitApi.getTokenList(provider);

    console.info({ [provider]: tokenList.count });

    fs.outputFile(
      `./src/tokenLists/${provider}.ts`,
      `export const list = ${JSON.stringify(tokenList)} as const;`,
      { flag: 'w' },
    );
  });
};

getTokens();

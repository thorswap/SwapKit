import { render } from 'ejs';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

import { CliOptions } from './cliTypes.js';

const copyDir = async (source: string, dest: string, options: any) => {
  mkdirSync(dest);
  const files = readdirSync(source);

  for (const f of files) {
    const target = join(
      dest,
      render(f.replace(/^\$/, '').replace('.ejs', ''), options, {
        openDelimiter: '{',
        closeDelimiter: '}',
      }),
    );

    const file = join(source, f);
    const stats = statSync(file);

    if (stats.isDirectory()) {
      await copyDir(file, target, options);
    } else {
      const content = readFileSync(file, 'utf8');
      const renderedFile = await render(content, options, { async: true });

      writeFileSync(target, renderedFile);
    }
  }
};

const LIB_FILES = resolve('./template/library');

export const copyFiles = async ({ packageType, packageName }: CliOptions) => {
  const options = { packageName };

  const packagePath = `../../packages/${packageType.toLowerCase()}/${packageName}`;

  return copyDir(LIB_FILES, packagePath, options);

  // TODO: Use in future for custom package types
  // switch (packageType) {
  //   case PackageType.Wallet:
  //   case PackageType.Toolbox:
  //   case PackageType.Swapkit:

  //   default:
  //     return true;
  // }
};

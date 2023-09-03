import type { QuestionCollection } from 'inquirer';

import { type CliOptions, PackageType } from './cliTypes.ts';

export const questions: QuestionCollection<CliOptions> = [
  {
    type: 'list',
    name: 'packageType',
    default: PackageType.Wallet,
    message: 'Select library type to generate',
    choices: [PackageType.Wallet, PackageType.Toolbox, PackageType.SwapKit],
  },
  {
    type: 'input',
    name: 'packageName',
    default: 'library-name',
    message:
      'Enter library name (start toolbox with "toolbox-" and swapkit with "swapkit-" prefix)',
  },
];

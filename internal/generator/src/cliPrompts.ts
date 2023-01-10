import { QuestionCollection } from 'inquirer';

import { CliOptions, PackageType } from './cliTypes.js';

export const questions: QuestionCollection<CliOptions> = [
  {
    type: 'list',
    name: 'packageType',
    default: PackageType.Common,
    message: 'Select library type to generate',
    choices: [PackageType.Common],
  },
  {
    type: 'input',
    name: 'packageName',
    default: 'library-name',
    message: 'Enter library name',
  },
];

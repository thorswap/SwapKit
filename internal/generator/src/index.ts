import { questions } from './cliPrompts.js';
import { copyFiles } from './copyFiles.js';
import { log, messages } from './log.js';

export const libGenerator = () => {
  log.accent(messages.logo);

  import('inquirer').then(({ default: inquirer }) => {
    inquirer.prompt(questions).then(({ packageType, packageName }) => {
      copyFiles({ packageType, packageName });
    });
  });
};

libGenerator();

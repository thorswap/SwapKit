import { questions } from './cliPrompts.ts';
import { copyFiles } from './copyFiles.ts';
import { log, messages } from './log.ts';

export const libGenerator = () => {
  log.accent(messages.logo);

  import('inquirer').then(({ default: inquirer }) => {
    inquirer.prompt(questions).then(({ packageType, packageName }) => {
      copyFiles({ packageType, packageName });
    });
  });
};

libGenerator();

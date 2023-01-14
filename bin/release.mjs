/**
 * Part of fusion project.
 *
 * @copyright  Copyright (C) 2018 Asikart.
 * @license    MIT
 */

import minimist from 'minimist';
import { execSync as exec } from 'child_process';

const cliInput = minimist(process.argv.slice(2));

const args = cliInput._;

if (!args.length) {
  console.log('Please provide release type (major | minor | patch | premajor | preminor | prepatch | prerelease)');
  process.exit(255);
}

const help = `
Usage: release.js -- <arguments for "npm version">
  -b    Branch name to push. 
`;

if (cliInput['help'] || cliInput['h']) {
  console.log(help);
  process.exit(0);
}

console.log(`>>> yarn build`);
exec(`yarn build`);

console.log(`>>> yarn build:prod`);
exec(`yarn build:prod`);

console.log(`>>> yarn build:i18n`);
exec(`yarn build:i18n`);

console.log(`>>> yarn build:css`);
exec(`yarn build:css`);

console.log(`>>> yarn build:css:prod`);
exec(`yarn build:css:prod`);

console.log(`>>> npm version ${args.join(' ')} --git-tag-version false`);
exec(`npm version ${args.join(' ')} --git-tag-version false`);

// console.log('>>> Git commit all');
// exec(`git add .`);
// try {
//   exec(`git commit -am "Prepare release @windwalker-io/unicorn."`);
// } catch (e) {
//   console.log(e.message);
// }
//
// const branch = cliInput['b'] || 'master';
//
// console.log('>>> Push to git');
//
// exec(`git push origin ${branch}`);
//
// console.log('>> Publish to npm');
//
// exec(`npm publish`);

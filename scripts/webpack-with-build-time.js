'use strict';

const { spawnSync } = require('node:child_process');

const webpackCli = require.resolve('webpack-cli/bin/cli.js');
const args = process.argv.slice(2);

const formattedBuildTime = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

const env = {
  ...process.env,
  LAST_BUILD_TIME: formattedBuildTime,
};

const result = spawnSync(process.execPath, [webpackCli, ...args], {
  stdio: 'inherit',
  env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}


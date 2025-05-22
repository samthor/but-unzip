#!/usr/bin/env node

import * as childProcess from 'child_process';
import * as fs from 'fs';

for (const platform of ['node', 'browser']) {
  // compile twice lol
  childProcess.execSync(`esbuild --format=esm --minify --bundle --tree-shaking=true --platform=${platform} src/index.js > index.${platform}-firstpass.min.mjs`);
  childProcess.execSync(`esbuild --format=esm --minify --platform=${platform} index.${platform}-firstpass.min.mjs > index.${platform}.min.mjs`);

  const stat = fs.statSync(`index.${platform}.min.mjs`);
  console.info(platform, '=>', stat.size);
}

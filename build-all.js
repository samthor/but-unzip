#!/usr/bin/env node

import * as childProcess from 'child_process';
import * as fs from 'fs';

for (const platform of ['node', 'browser']) {
  childProcess.execSync(`esbuild --format=esm --bundle --minify --tree-shaking=true --platform=${platform} src/index.js > index.${platform}.min.mjs`);

  const stat = fs.statSync(`index.${platform}.min.mjs`);
  console.info(platform, '=>', stat.size);
}

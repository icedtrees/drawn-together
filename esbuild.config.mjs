import * as esbuild from "esbuild";
import start from '@es-exec/esbuild-plugin-start';

const context = await esbuild.context({
  entryPoints: [
    'src/server.ts',
    'config/**/*.ts',
    'config/**/*.js',
    'modules/server/**/*.ts',
    'modules/server/**/*.js',
    'modules/shared/**/*.ts',
    'modules/shared/**/*.js',
  ],
  bundle: false,
  platform: 'node',
  format: 'cjs',
  outdir: 'build',
  sourcemap: true,
  plugins: [start({
    script: 'node build/src/server.js',
  })],
});

context.watch();
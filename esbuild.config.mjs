/**
 * Run with node esbuild.config.mjs in order to build the backend
 */
import * as esbuild from "esbuild";
import start from '@es-exec/esbuild-plugin-start';

// "watch" or "build"
const command = process.argv[2];

const baseOptions = {
  entryPoints: [
    'src/server.ts',
    'config/**/*.ts',
    'config/**/*.js',
    'modules/server/**/*.ts',
    'modules/server/**/*.js',
    'modules/server/**/*.html',
    'modules/shared/**/*.ts',
    'modules/shared/**/*.js',
    // For some reason the server depends on assets from the client section
    'modules/client/**/*.ico',
    'modules/client/**/*.png',
    // Serve public assets. Note that these get copied into the same place as the built frontend assets,
    // which could technically cause name clashes.
    'public/**/*.*',
  ],
  loader: {
    '.html': 'copy',
    '.ico': 'copy',
    '.png': 'copy',
    '.txt': 'copy',
  },
  bundle: false,
  platform: 'node',
  format: 'cjs',
  outdir: 'build',
  sourcemap: true,
}

if (command === 'watch') {
  const context = await esbuild.context({
    ...baseOptions,
    plugins: command === 'watch' ? [start({
      script: 'cd build && node src/server.js',
    })] : [],
  });
  await context.watch();
} else if (command === 'build') {
  await esbuild.build(baseOptions);
} else {
  console.error(`Unknown command ${command}`);
  process.exit(1);
}
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const libraryName = 'hcWebsiteTouchpoint';

export default {
  input: 'src/index.ts',
  output: {
    file: pkg.main,
    name: libraryName,
    format: 'umd',
    sourcemap: true,
  },
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        declaration: false, // Already handled by separate tsc build
        sourceMap: true,
        inlineSources: true,
        outDir: 'build/umd', // Match Rollup output directory
      },
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};

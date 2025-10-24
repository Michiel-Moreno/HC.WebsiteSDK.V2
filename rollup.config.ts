import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { visualizer } from 'rollup-plugin-visualizer';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const libraryName = 'hcWebsiteTouchpoint';

export default {
  input: 'src/index.ts',
  output: {
    file: pkg.main,
    name: libraryName,
    format: 'umd',
    sourcemap: false, // Disabled for smaller production bundle
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
        sourceMap: false, // Disabled for smaller production bundle
        outDir: 'build/umd', // Match Rollup output directory
      },
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    terser({
      compress: {
        drop_console: false, // Keep console for SDK warnings
        pure_getters: true, // Assume getters have no side effects
        passes: 2, // Multiple passes for better minification
        dead_code: true, // Remove unreachable code
        drop_debugger: true, // Remove debugger statements
      },
      mangle: {
        properties: {
          regex: /^_/, // Only mangle properties starting with underscore
        },
      },
      format: {
        comments: false, // Remove all comments
      },
    }),
    visualizer({
      filename: 'bundle-analysis.html',
      open: false, // Don't auto-open browser
      gzipSize: true, // Show gzipped sizes
      brotliSize: true, // Show brotli compressed sizes
      template: 'treemap', // Visual treemap of bundle composition
    }),
  ],
};

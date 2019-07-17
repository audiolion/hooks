import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const globals = { react: 'React' };

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'hooks',
      file: pkg.browser,
      format: 'umd',
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      resolve(), // so Rollup can find deps
      commonjs(), // so Rollup can convert deps to an ES module
      typescript({
        typescript: require('typescript'),
      }), // so Rollup can convert TypeScript to JavaScript
      terser(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.ts',
    external: Object.keys(globals),
    plugins: [
      typescript({
        typescript: require('typescript'),
      }), // so Rollup can convert TypeScript to JavaScript,
      terser(),
    ],
    output: [
      { file: pkg.main, format: 'cjs', globals },
      { file: pkg.module, format: 'esm', globals },
    ],
  },
];

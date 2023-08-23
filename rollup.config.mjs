/**
 * Part of taiwan-city-selector project.
 *
 * @copyright  Copyright (C) 2023 __ORGANIZATION__.
 * @license    __LICENSE__
 */

import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import fs from 'fs';
import cleanup from 'rollup-plugin-cleanup';
import dts from 'rollup-plugin-dts';
import esbuild, { minify } from 'rollup-plugin-esbuild';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// @see https://gist.github.com/aleclarson/9900ed2a9a3119d865286b218e14d226
export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: pkg.browser,
        format: 'umd',
        sourcemap: true,
        name: 'Spectrum',
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
      },
      ...(process.env.NODE_ENV === 'production'
      ? [
      {
          file: addMinToFilename(pkg.browser),
          format: 'esm',
          sourcemap: true,
          name: 'Spectrum',
          plugins: [
            minify(),
          ]
        },
        {
          file: addMinToFilename(pkg.module),
          format: 'es',
          sourcemap: true,
          plugins: [
            minify(),
          ]
        }
      ]
      : [])
    ],
    plugins: [
      nodeResolve(),
      typescript()
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: pkg.typings,
      format: 'es',
    },
    plugins: [
      dts()
    ]
  }
];

function addMinToFilename(fileName) {
  return fileName.replace(/.js$/, '.min.js');
}

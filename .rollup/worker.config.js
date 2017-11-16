'use strict'

const path = require('path')

// rollup plugins
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify')

const plugins = [
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      [
        'es2015',
        {
          modules: false
        }
      ],
      'stage-3'
    ],
    plugins: [
      'external-helpers',
      [
        'css-modules-transform',
        {
          generateScopedName: 'node-functional-starter-[local]'
        }
      ],
      'transform-flow-strip-types',
      ['transform-react-jsx', {pragma: 'el'}]
    ]
  }),
  nodeResolve({
    browser: true,
    jsnext: true,
    main: true,
    module: true,
    customResolveOptions: {
      paths: process.env.NODE_PATH.split(/[;:]/)
    }
  }),
  commonjs()
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(uglify())
}

module.exports = {
  input: path.resolve(__dirname, '../src/client/worker.js'),
  output: {
    file: path.resolve(__dirname, '../build/browser/worker.js'),
    format: 'iife'
  },
  plugins
}

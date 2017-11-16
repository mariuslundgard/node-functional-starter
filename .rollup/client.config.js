'use strict'

const path = require('path')

// rollup plugins
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const postcss = require('rollup-plugin-postcss')
const nodeResolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify')

// postcss plugins
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const postcssColorFunction = require('postcss-color-function')
const postcssCssVariables = require('postcss-css-variables')
const postcssModules = require('postcss-modules')
const postcssNesting = require('postcss-nesting')
const postcssImport = require('postcss-import')

const cssExportMap = {}

const postcssPlugins = [
  postcssImport(),
  postcssNesting,
  postcssCssVariables,
  postcssColorFunction,
  autoprefixer({browsers: ['last 2 versions']}),
  postcssModules({
    generateScopedName: 'node-functional-starter-[local]',
    getJSON(id, exportTokens) {
      cssExportMap[id] = exportTokens
    }
  })
]

if (process.env.NODE_ENV === 'production') {
  postcssPlugins.push(cssnano())
}

const plugins = [
  postcss({
    extract: path.resolve(__dirname, '../build/browser/client.css'),
    plugins: postcssPlugins,
    getExportNamed: false,
    getExport(id) {
      return cssExportMap[id]
    },
    sourceMap: true
  }),
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
    plugins: ['external-helpers', 'transform-flow-strip-types', ['transform-react-jsx', {pragma: 'el'}]]
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
  input: path.resolve(__dirname, '../src/client/browser.js'),
  output: {
    file: path.resolve(__dirname, '../build/browser/client.js'),
    format: 'iife'
  },
  plugins
}

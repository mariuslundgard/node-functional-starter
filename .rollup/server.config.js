import path from 'path'

// rollup plugins
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'

const plugins = [
  babel({
    babelrc: false,
    exclude: 'node_modules/**',
    presets: [
      [
        'env',
        {
          modules: false,
          targets: {
            node: '8.9.1'
          }
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
    module: false,
    main: true,
    customResolveOptions: {
      paths: process.env.NODE_PATH.split(/[;:]/)
    },
    preferBuiltins: true
  }),
  json({include: 'node_modules/**'}),
  commonjs({
    include: 'node_modules/**',
    namedExports: {
      http: ['METHODS'],
      url: ['parse']
    }
  })
]

export default {
  input: path.resolve(__dirname, '../src/server.js'),
  output: {
    file: path.resolve(__dirname, '../build/server.js'),
    format: 'cjs'
  },
  plugins
}

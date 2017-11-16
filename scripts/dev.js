'use strict'

const chokidar = require('chokidar')
const express = require('express')
const path = require('path')
const rollup = require('rollup')

const rollupClientConfig = require('../.rollup/client.config')
const rollupWorkerConfig = require('../.rollup/worker.config')

const sourcePath = path.resolve(__dirname, '../src')
const serverPath = path.resolve(__dirname, '../src/server')

require('babel-register')({
  only: sourcePath
})

const config = {
  manifest: {
    'client.css': 'client.css',
    'client.js': 'client.js',
    'worker.js': 'worker.js'
  }
}

const port = 3000

// Setup server-side watcher
const watcher = chokidar.watch(sourcePath)
watcher.on('ready', () => {
  watcher.on('all', () => {
    const paths = Object.keys(require.cache).filter(key => key.startsWith(sourcePath))

    if (paths.length) console.log('server changed')

    paths.forEach(key => {
      delete require.cache[key]
    })
  })
})

// Setup HTTP server
const app = express()

app.use(express.static(path.resolve(__dirname, '../build/browser')))

app.use((req, res, next) => {
  require(serverPath).create(config)(req, res, next)
})

const rollupWatcher = rollup.watch([rollupClientConfig, rollupWorkerConfig])

rollupWatcher.on('event', event => {
  if (event.code === 'END') console.log('built browser bundles')
})

// Start HTTP server
app.listen(port, err => {
  if (err) {
    console.log(err)
    process.exit(1)
  } else {
    console.log(`Listening at http://localhost:${port}`)
  }
})

// Log uncaught exceptions and rejections
process.on('uncaughtException', err => {
  console.error(`Uncaught exception occured: ${err}`)
  console.log(err.stack)
})
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection occured:', p, 'reason:', reason)
  console.log(reason, p)
})

'use strict'

const compression = require('compression')
const express = require('express')
const path = require('path')

const config = {
  manifest: {
    'main.css': 'main.css',
    'main.js': 'main.js',
    'main-worker.js': 'main-worker.js'
  }
}

const port = 3000

// Setup HTTP server
const app = express()
app.use(compression())
app.use(express.static(path.resolve(__dirname, '../build/browser')))
app.use((req, res, next) => {
  require('../build/server').create(config)(req, res, next)
})

// Start HTTP server
const server = app.listen(port, err => {
  if (err) {
    console.log(err)
    process.exit(1)
  } else {
    const host = server.address().address
    console.log(`Listening at http://${host}:${port}`)
  }
})

// Log uncaught exceptions and rejections
process.on('uncaughtException', err => {
  console.error(`Uncaught exception occured: ${err}`)
  process.exit(1)
})
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled rejection occured:', p, 'reason:', reason)
  process.exit(1)
})

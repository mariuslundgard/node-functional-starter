// @flow

import express from 'express'
import * as api from './api/server'
import * as client from './client/server'

import type {Config} from './types'

export function create (config: Config) {
  const server = express()

  server.use('/api', api.create(config))
  server.use('/', client.create(config))

  return server
}

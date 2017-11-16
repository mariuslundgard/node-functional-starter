// @flow

import request from 'request/browser'
import {run} from 'runtime/worker'
import batchHandler from 'runtime-batch/handler'
import httpHandler from 'runtime-http/handler'
import * as root from './root'

const handlers = [batchHandler, httpHandler.create({transport: request})]

const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error
}

run({
  handlers,
  logger,
  program: root,
  scope: self
})

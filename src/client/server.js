// @flow

import express from 'express'
import layout from 'layout'
import request from 'request/server'
import {run} from 'runtime/server'
import httpHandler from 'runtime-http/handler'
import * as root from './root'
import style from './style.css'

import type {$Request, $Response} from 'express'
import type {Config} from '../types'

export function create (config: Config) {
  const {manifest} = config
  const router = express.Router()

  router.get('/*', async (req: $Request, res: $Response) => {
    const handlers = [httpHandler.create({baseUrl: 'http://localhost:3000', transport: request})]
    const props: root.Props = {
      path: req.path
    }

    try {
      const {html, model} = await run({handlers, program: root, props})
      const encodedState = encodeURIComponent(JSON.stringify(root.mapModelToProps(model)))

      res.send(
        layout({
          title: 'Main',
          head: `<link rel="stylesheet" href="/${manifest['client.css']}">`,
          body: [
            `<div id="${style.root}" data-worker-url="/${manifest['worker.js']}" data-state="${encodedState}">`,
            html,
            `</div>`,
            `<script src="/${manifest['client.js']}"></script>`
          ].join('')
        })
      )
    } catch (err) {
      res.status(500)
      res.set('Content-Type', 'text/plain')
      res.send(err.stack)
    }
  })

  return router
}

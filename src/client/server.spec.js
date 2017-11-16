// @flow

import express from 'express'
import supertest from 'supertest'
import * as server from './server'

describe('main', () => {
  it('should respond with a rendered component', async () => {
    const app = express()

    app.use(
      server.create({
        manifest: {
          'main.js': 'main.js',
          'main.css': 'main.css',
          'main-worker.js': 'main-worker.js'
        }
      })
    )

    const res = await supertest(app).get('/')

    expect(res.text).toContain('<title>Main</title>')
    expect(res.text).toContain('<link rel="stylesheet" href="/main.css">')
    expect(res.text).toContain('<div class="node-functional-starter-main">')
    expect(res.text).toContain('<script src="/main.js"></script>')
  })
})

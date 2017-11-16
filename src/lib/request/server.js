// @flow

import * as http from 'http'
import {parse as parseUrl} from 'url'

import type {Observer, Opts} from './types'

function createRequestObservable (method: string, url: string, opts: Opts = {}) {
  let req: any = null

  return {
    method,
    url,

    subscribe (observer: Observer) {
      const urlInfo = parseUrl(url)
      const params = {
        method,
        protocol: urlInfo.protocol,
        host: urlInfo.hostname,
        port: urlInfo.port,
        path: urlInfo.path
      }

      let text = ''

      req = http.request(params, res => {
        res.on('data', buf => {
          text += buf.toString()
        })

        res.on('error', () => {
          if (observer.error) observer.error(new Error('Something went wrong'))
          if (observer.complete) observer.complete()
        })

        res.on('abort', () => {
          if (observer.complete) observer.complete()
        })

        res.on('end', () => {
          observer.next({
            readyState: 4,
            headers: res.headers,
            status: res.statusCode,
            text,
            bytesTotal: text.length,
            bytesLoaded: text.length
          })
          if (observer.complete) observer.complete()
        })
      })

      req.end()

      return {
        unsubscribe () {
          // TODO: dispose
        }
      }
    }
  }
}

function get (url: string, opts: Opts = {}) {
  return createRequestObservable('GET', url, opts)
}

export default {get}

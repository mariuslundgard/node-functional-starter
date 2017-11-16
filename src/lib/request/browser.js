// @flow

import type {Headers, Observer, Opts} from './types'

function createRequestObservable (method: string, url: string, opts: Opts = {}) {
  const async = opts.async || true

  let req: any = null

  return {
    method,
    url,
    subscribe (observer: Observer) {
      const xhr = (req = new XMLHttpRequest())

      let status = null
      let headers: Headers = {}
      let bytesTotal = -1
      let bytesLoaded = -1

      req.onerror = () => {
        const err: any = new Error('HTTP request failed')

        err.response = {
          readyState: 4,
          headers,
          status: xhr.status,
          text: xhr.responseText
        }

        if (observer.error) observer.error(err)
        if (observer.complete) observer.complete()

        req = null
      }

      req.onprogress = evt => {
        if (evt.lengthComputable) {
          bytesTotal = evt.total
          bytesLoaded = evt.loaded
          observer.next({
            readyState: 3,
            headers,
            status,
            bytesTotal,
            bytesLoaded
          })
        }
      }

      req.onreadystatechange = () => {
        switch (xhr.readyState) {
          case 0: // xhr.UNSET:
            observer.next({readyState: 0})
            break
          case 1: // xhr.OPENED:
            observer.next({readyState: 1})
            req.send()
            break
          case 2: // xhr.HEADERS_RECEIVED:
            status = xhr.status
            headers = xhr
              .getAllResponseHeaders()
              .trim()
              .split('\n')
              .reduce((headers, line) => {
                const parts = line.split(/:/)
                headers[parts[0].trim()] = parts[1].trim()
                return headers
              }, {})
            observer.next({readyState: 2, headers, status})
            break
          case 3: // xhr.LOADING:
            observer.next({
              readyState: 3,
              headers,
              status,
              bytesTotal,
              bytesLoaded
            })
            break
          case 4: // xhr.DONE:
            observer.next({
              readyState: 4,
              headers,
              status,
              text: xhr.responseText,
              bytesTotal,
              bytesLoaded
            })
            if (observer.complete) observer.complete()
            req = null
            break
        }
      }

      req.open(method, url, async)

      return {
        unsubscribe () {
          if (observer.complete) observer.complete()
          if (req) {
            req.abort()
            req = null
          }
        }
      }
    }
  }
}

function get (url: string, opts: Opts) {
  return createRequestObservable('GET', url, opts)
}

export default {get}

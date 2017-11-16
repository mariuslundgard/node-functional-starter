// @flow

import type {HttpAbort, HttpGet, HttpRequest, HttpResponse, RequestMap} from './types'

const requests: RequestMap = {}

let i = 0

type Opts = {
  baseUrl?: string,
  transport: any
}

const create = (opts: Opts) => {
  const baseUrl = opts.baseUrl || ''
  const {transport} = opts

  if (!transport) {
    throw new Error('Missing HTTP transport')
  }

  return {
    HTTP_ABORT (cmd: HttpAbort, handleMsg: () => void, handleCmd: () => void, done?: () => void) {
      if (requests[cmd.id]) {
        requests[cmd.id].unsubscribe()
        requests[cmd.id] = null
      }

      if (done) done()
    },

    HTTP_GET (
      cmd: HttpGet,
      handleMsg: (msg: HttpRequest | HttpResponse) => void,
      handleCmd: () => void,
      done?: () => void
    ) {
      const url = cmd.url
      const labels = cmd.opts.labels || {}
      const id = `request_${i++}`
      const reqMsg: HttpRequest = {type: 'HTTP_REQUEST', id, url, labels}

      handleMsg(reqMsg)

      requests[id] = transport.get(`${baseUrl}${url}`).subscribe({
        next (res) {
          let body
          try {
            body = JSON.parse(res.text)
          } catch (_) {}

          handleMsg({
            type: 'HTTP_RESPONSE',
            url,
            labels,
            errorMessage: null,
            body,
            payload: res
          })
        },

        error (err) {
          const res = err.response

          let body
          try {
            body = JSON.parse(res.text)
          } catch (_) {}

          handleMsg({
            type: 'HTTP_RESPONSE',
            url,
            labels,
            errorMessage: err.message,
            body,
            payload: err.response
          })
        },

        complete () {
          if (done) done()
        }
      })
    }
  }
}

export default {create}

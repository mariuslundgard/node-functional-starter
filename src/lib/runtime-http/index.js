// @flow

import type {HttpAbort, HttpGet, HttpOpts, HttpRequest, HttpResponse} from './types'

export type {HttpGet, HttpRequest, HttpResponse}

export const abort = (id: string): HttpAbort => {
  return {type: 'HTTP_ABORT', id}
}

export const get = (url: string, opts: HttpOpts = {}): HttpGet => {
  return {type: 'HTTP_GET', url, opts}
}

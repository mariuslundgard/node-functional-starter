// @flow

import type {Response} from 'request/types'

export type HttpAbort = {
  type: 'HTTP_ABORT',
  id: string
}

export type HttpOpts = {
  labels?: {[key: string]: any}
}

export type HttpGet = {
  type: 'HTTP_GET',
  url: string,
  opts: HttpOpts
}

export type HttpRequest = {
  type: 'HTTP_REQUEST',
  id: string,
  url: string,
  labels?: {[key: string]: string}
}

export type HttpResponse = {
  type: 'HTTP_RESPONSE',
  // readyState: 0 | 1 | 2 | 3 | 4,
  // status: number,
  // headers: {[key: string]: string},
  url: string,
  labels?: {[key: string]: string},
  // text: string,
  body: any,
  errorMessage: string | null,
  payload: Response
}

export type RequestMap = {
  [id: string]: any
}

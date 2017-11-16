// @flow

export type Opts = {
  method?: string,
  async?: boolean
}

export type Headers = {[key: string]: string}

type StatusCode = number | null

type ResponseUnset = {readyState: 0}
type ResponseOpened = {readyState: 1}
type ResponseHeadersReceived = {readyState: 2, headers: Headers, status: StatusCode}
type ResponseLoading = {readyState: 3, headers: Headers, status: StatusCode, bytesLoaded: number, bytesTotal: number}
type ResponseDone = {
  readyState: 4,
  headers: Headers,
  status: StatusCode,
  text: string,
  bytesLoaded: number,
  bytesTotal: number
}

export type Response = ResponseUnset | ResponseOpened | ResponseHeadersReceived | ResponseLoading | ResponseDone

export type Observer = {
  next: Response => void,
  error?: (err: any) => void,
  complete?: () => void
}

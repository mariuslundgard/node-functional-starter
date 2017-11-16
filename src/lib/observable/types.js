// @flow

export type Observer = {
  next: (data: any) => void,
  error?: (err: Error) => void,
  complete?: () => void
}

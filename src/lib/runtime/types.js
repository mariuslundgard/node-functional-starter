// @flow

import type {VNode} from '@transclusion/vdom'

export type Handler<T, Msg, Cmd> = (
  msg: T,
  handleMsg: (msg: Msg) => void,
  handleMsg: (msg: Cmd) => void,
  done?: () => void
) => void

export type Handlers<T, Msg, Cmd> = {
  [cmdKey: string]: Handler<T, Msg, Cmd>
}

type MsgFactory = (...args?: any[]) => void

export type Port = string | MsgFactory

export type Ports = {
  [name: string]: Port
}

export type Program<Props, Model, Msg, Cmd> = {
  ports?: Ports,
  extractProps?: (model: Model) => Props,
  update: (model: Model, msg: Msg) => [Model, Cmd],
  init(props: Props): [Model, Cmd],
  view(model: any): VNode
}

export type Logger = {
  info: (...args: any[]) => void,
  warn: (...args: any[]) => void,
  error: (...args: any[]) => void
}

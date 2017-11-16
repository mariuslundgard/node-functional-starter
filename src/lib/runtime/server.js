// @flow

import {toHTML} from '@transclusion/vdom'

import type {VNode} from '@transclusion/vdom'
import type {Handlers, Program} from './types'

type Opts = {
  handlers: Handlers<any, any, any>[],
  program: Program<any, any, any, any>,
  props: any
}

export function run (opts: Opts): Promise<any> {
  const {handlers, program, props} = opts
  const msgQueue: any[] = []

  let model: any
  let cmd: any
  let vNode: VNode

  function handleCmd (_cmd: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const handler = handlers.find((h: any) => h.hasOwnProperty(_cmd.type))

      if (handler) {
        handler[_cmd.type](
          _cmd,
          (msg: any) => {
            msgQueue.push(msg)
          },
          handleCmd,
          resolve
        )
      } else {
        reject(
          new Error(`Unknown command type: ${_cmd.type}
Did you remember to add a command handler for this command type?`)
        )
      }
    })
  }

  function handleMsgQueue (): Promise<void> {
    if (msgQueue.length === 0) {
      return Promise.resolve()
    }

    const msg = msgQueue.shift()
    ;[model, cmd] = program.update(model, msg)
    vNode = program.view(model)

    if (cmd) {
      return handleCmd(cmd).then(() => {
        return handleMsgQueue()
      })
    }

    return handleMsgQueue()
  }

  ;[model, cmd] = program.init(props)
  vNode = program.view(model)

  if (cmd) {
    return handleCmd(cmd)
      .then(() => handleMsgQueue())
      .then(() => ({html: toHTML(vNode), model}))
  } else {
    return Promise.resolve({html: toHTML(vNode), model})
  }
}

// @flow

import {diff} from '@transclusion/vdom'
import {createIncomingStream, createOutgoingEffect} from 'message-stream'

import type {VNode} from '@transclusion/vdom'
import type {Handler, Logger, Program} from './types'

type Opts = {
  logger: Logger,
  program: Program<any, any, any, any>,
  scope: any, // WorkerGlobalScope
  handlers: Handler[]
}

export function run (opts: Opts) {
  const {handlers, logger, program, scope} = opts
  const incomingMessageStream = createIncomingStream(scope)
  const outgoingMessageEffect = createOutgoingEffect(scope)
  const portMap: {
    [key: string]: string
  } = {}

  const {ports} = program

  let vNode: VNode
  let model: any // : Model
  let cmds = null

  const handleInit = (data: any) => {
    vNode = data.vNode
    ;[model, ...cmds] = program.init(data.props)

    const nextVNode = program.view(model)
    const patches = diff(vNode, nextVNode)

    vNode = nextVNode

    outgoingMessageEffect.next({
      type: 'INIT',
      patches,
      ports: ports
        ? Object.keys(ports).map(key => {
          const p = ports[key]

          if (typeof p === 'string') {
            portMap[p] = key
            return {key, subscriber: false}
          } else {
            return {key, subscriber: true}
          }
        })
        : [],
      vNode
    })

    handleCmd(cmds)
  }

  function handleMsg (msg: any) {
    const prevModel = model
    ;[model, ...cmds] = program.update(model, msg)

    handleCmd(cmds)

    if (prevModel !== model) {
      const nextVNode = program.view(model)
      const patches = diff(vNode, nextVNode)

      vNode = nextVNode

      if (patches.length) outgoingMessageEffect.next({type: 'PATCH', patches})
    }

    if (portMap[msg.type]) {
      outgoingMessageEffect.next({
        type: 'NOTIFY_SUBSCRIBERS',
        name: portMap[msg.type],
        msg
      })
    }
  }

  function handleCmd (_cmd: any) {
    if (!_cmd) return

    if (Array.isArray(_cmd)) {
      _cmd.forEach(handleCmd)
      return
    }

    const handler = handlers.find((h: any) => h.hasOwnProperty(_cmd.type))

    if (portMap[_cmd.type]) {
      outgoingMessageEffect.next({
        type: 'NOTIFY_SUBSCRIBERS',
        name: portMap[_cmd.type],
        msg: _cmd
      })
    } else if (handler) {
      handler[_cmd.type](_cmd, handleMsg, handleCmd)
    } else {
      logger.error(`Unknown command type: ${_cmd.type}\n
Did you remember to add a command handler for this command type?`)
    }
  }

  // Subscribe to messages from the main thread
  incomingMessageStream({
    next (data) {
      switch (data.type) {
        case 'INIT':
          handleInit(data)
          break

        case 'MSG':
          handleMsg(data.msg)
          break

        case 'PORT_VALUE':
          const port = ports && ports[data.name]
          if (typeof port === 'function') {
            handleMsg(port(data.value))
          }
          break

        default:
          logger.error(`Unexpected data type: ${data.type}`)
          break
      }
    },

    error (err: any) {
      logger.error(`${err}`)
    },

    complete () {
      logger.warn(`The connection to the main thread was closed`)
    }
  })
}

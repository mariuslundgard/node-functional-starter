// @flow

import {mount, patch, toVNode} from '@transclusion/vdom'
import {createIncomingStream, createOutgoingEffect} from 'message-stream'

import type {Logger, Ports} from './types'

type Opts = {
  logger: Logger,
  element: HTMLElement,
  worker: Worker,
  props: any
}

type SubscriptionMap = {
  [key: string]: any
}

type RunContext = {
  ports: Ports
}

type RunFn = (opts: Opts) => Promise<RunContext>

export const run: RunFn = (opts: Opts) =>
  new Promise((resolve: Function) => {
    const {element, logger, props, worker} = opts
    const ports: any = {}
    const incomingMessageStream = createIncomingStream(worker)
    const outgoingMessageEffect = createOutgoingEffect(worker)
    const vNode = toVNode(element)
    const subscriptions: SubscriptionMap = {}

    let isInitialized = false

    outgoingMessageEffect.next({
      type: 'INIT',
      props,
      vNode
    })

    function handleEvent (eventType: string, event: MessageEvent, value: any) {
      if (typeof value === 'object' && value.preventDefault) {
        event.preventDefault()
      }

      const target: any = event.target

      switch (event.type) {
        case 'input':
          outgoingMessageEffect.next({
            type: 'MSG',
            msg: {
              ...value,
              value: target.value
            }
          })
          break

        default:
          outgoingMessageEffect.next({
            type: 'MSG',
            msg: value
          })
          break
      }
    }

    function handleLifecycleHook (el: Element, value: any) {
      outgoingMessageEffect.next({
        type: 'MSG',
        msg: value
      })
    }

    incomingMessageStream({
      next (data) {
        switch (data.type) {
          case 'PATCH':
            patch(element, data.patches, handleEvent, handleLifecycleHook)
            break

          case 'INIT':
            if (isInitialized) return

            isInitialized = true

            data.ports.forEach((port: any) => {
              if (port.subscriber) {
                ports[port.key] = {
                  send (value: any) {
                    outgoingMessageEffect.next({
                      type: 'PORT_VALUE',
                      name: port.key,
                      value
                    })
                  }
                }
              } else {
                subscriptions[port.key] = []
                ports[port.key] = {
                  subscribe (observer: (value: any) => void) {
                    subscriptions[port.key].push(observer)
                  }
                }
              }
            })

            mount(element, data.vNode, handleEvent)
            patch(element, data.patches, handleEvent, handleLifecycleHook)
            resolve({ports})
            break

          case 'NOTIFY_SUBSCRIBERS':
            subscriptions[data.name].forEach((subscriber: (value: any) => void) => subscriber(data.msg))
            break

          default:
            logger.error(`Unknown data type: ${data.type}`)
            break
        }
      }
    })
  })

// @flow

import type {Observer} from 'observable/types'

export const createIncomingStream = (scope: any) => (observer: Observer) => {
  scope.onmessage = (event: any) => {
    observer.next(JSON.parse(event.data))
  }

  scope.onerror = () => {
    if (observer.error) observer.error(new Error('Something went wrong'))
  }

  scope.onclose = () => {
    if (observer.complete) observer.complete()
  }

  return () => {
    // nothing to dispose
  }
}

export const createOutgoingEffect = (scope: any): Observer => ({
  next (data: any) {
    const message = JSON.stringify(data)
    scope.postMessage(message)
  }
})

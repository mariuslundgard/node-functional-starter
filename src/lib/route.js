// @flow

import pathToRegexp from 'path-to-regexp'

type Routes = {
  [pattern: string]: any
}

export type Route = {
  params: {
    [key: string]: string
  },
  value: string
}

export function matchRoute (path: string, routes: Routes) {
  let match: Route | null = null

  Object.keys(routes).some(pattern => {
    const keys = []
    const re = pathToRegexp(pattern, keys)
    const result = re.exec(path)

    if (result) {
      match = {value: routes[pattern], params: {}}
      match.params = keys.reduce((params, key, idx) => {
        params[key.name] = result[idx + 1]
        return params
      }, match.params)
      return true
    }

    return false
  })

  return match
}

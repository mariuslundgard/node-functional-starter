// @flow

/** @jsx el */

import {bem} from 'bem'
import {matchRoute} from 'route'
import {batch} from 'runtime-batch'
// eslint-disable-next-line no-unused-vars
import {el} from 'vdom'
import style from './style.css'

// Import screens
import * as blog from './screens/blog'
import * as home from './screens/home'
import * as post from './screens/post'

import type {Route} from 'route'
import type {Batch} from 'runtime-batch'
import type {Link} from '../types'

export type Props = {
  path: string,
  screen?: blog.Props | home.Props | post.Props
}

type Model = {
  path: string,
  nextRoute?: Route,
  nextScreen?: any, // blog.Model | home.Model | post.Model
  route?: Route,
  screen?: any // blog.Model | home.Model | post.Model
}

type Cmd = Batch | blog.Cmd | home.Cmd | post.Cmd | null

type EffectDone = {type: 'EFFECT_DONE'}
type HistoryPushState = {type: 'HISTORY_PUSH_STATE', preventDefault: boolean, path: string, effect?: any}
type HistoryPopState = {type: 'HISTORY_POP_STATE', path: string, effect?: any}

type Msg = EffectDone | HistoryPushState | HistoryPopState | blog.Msg | home.Msg | post.Msg

const routes = {
  '/': 'home',
  '/blog': 'blog',
  '/post/:id': 'post'
}

const screens = {
  blog,
  home,
  post
}

export const ports = {
  effect: 'EFFECT',
  effectDone () {
    return {type: 'EFFECT_DONE'}
  },
  historyPushState: 'HISTORY_PUSH_STATE',
  historyPopState (path: string) {
    return {type: 'HISTORY_POP_STATE', path}
  }
}

function buildLinks (path: string): Link[] {
  return [
    // {
    //   active: path === '/',
    //   label: 'Home',
    //   path: '/'
    // },
    {
      active: path === '/blog',
      label: 'Blog',
      path: '/blog'
    }
  ]
}

export function init (props: Props): [Model, Cmd] {
  const route = matchRoute(props.path, routes)

  if (route) {
    const [screenModel, screenCmd] = screens[route.value].init(
      props.screen || {links: buildLinks(props.path), params: route.params}
    )

    return [
      {
        path: props.path,
        route,
        screen: screenModel
      },
      screenCmd
    ]
  }

  return [{path: props.path}, null]
}

export function mapModelToProps (model: Model): Props {
  if (model.route && screens[model.route.value]) {
    return {
      path: model.path,
      screen: screens[model.route.value].mapModelToProps(model.screen)
    }
  }

  return {
    path: model.path
  }
}

export function update (model: Model, msg: Msg): [Model, Cmd] {
  switch (msg.type) {
    case 'HISTORY_PUSH_STATE':
    case 'HISTORY_POP_STATE': {
      const route = matchRoute(msg.path, routes)

      if (route) {
        const [screenModel, screenCmd] = screens[route.value].init({links: buildLinks(msg.path), params: route.params})

        if (msg.effect) {
          return [
            {
              ...model,
              path: msg.path,
              nextRoute: route,
              nextScreen: screenModel
            },
            batch(screenCmd, {type: 'EFFECT', effect: msg.effect})
          ]
        }

        return [
          {
            path: msg.path,
            route,
            screen: screenModel
          },
          screenCmd
        ]
      }

      return [{path: msg.path}, null]
    }

    case 'EFFECT_DONE':
      return [
        {
          path: model.path,
          route: model.nextRoute,
          screen: model.nextScreen
        },
        null
      ]

    default: {
      if (model.nextRoute) {
        const [screenModel, screenCmd] = screens[model.nextRoute.value].update(model.nextScreen, msg)

        return [{...model, nextScreen: screenModel}, screenCmd]
      }

      if (model.route) {
        const [screenModel, screenCmd] = screens[model.route.value].update(model.screen, msg)

        return [{...model, screen: screenModel}, screenCmd]
      }

      console.log('Unhandled message:', msg)
      return [model, null]
    }
  }
}

export function screenView ({next, route, screen}) {
  if (!route) return <div class={bem(style.main__screen, next && 'next')}>Not found</div>

  switch (route.value) {
    case 'blog':
      return screen && <div class={bem(style.main__screen, next && 'next')}>{blog.view(screen)}</div>
    case 'home':
      return screen && <div class={bem(style.main__screen, next && 'next')}>{home.view(screen)}</div>
    case 'post':
      return screen && <div class={bem(style.main__screen, next && 'next')}>{post.view(screen)}</div>
    default:
      return <div class={bem(style.main__screen, next && 'next')}>Not found</div>
  }
}

export function view (model: Model) {
  return (
    <div class={style.main}>
      {screenView({route: model.route, screen: model.screen})}
      {model.nextRoute && screenView({next: true, route: model.nextRoute, screen: model.nextScreen})}
    </div>
  )
}

// @flow

/** @jsx el */

import * as http from 'runtime-http'
// eslint-disable-next-line no-unused-vars
import {el} from 'vdom'
import style from './style.css'

// Import components
import * as nav from '../../components/nav'

import type {HttpGet, HttpRequest, HttpResponse} from 'runtime-http'
import type {Link, PostPreview} from '../../../types'

type Params = {}

type Data = {
  title: string,
  _embedded: {postPreview: PostPreview[]}
}

export type Props = {
  data?: Data,
  links: Link[],
  params: Params
}

export type Model = {
  data?: Data,
  isLoading: boolean,
  links: Link[],
  loadProgress: number,
  params: Params
}

export type Cmd = HttpGet | null

export type Msg = HttpRequest | HttpResponse

export function init (props: Props): [Model, Cmd] {
  if (props.data) {
    return [{data: props.data, isLoading: false, links: props.links, loadProgress: 1, params: props.params}, null]
  }

  return [{isLoading: true, links: props.links, loadProgress: 0, params: props.params}, http.get('/api/home')]
}

export function mapModelToProps (model: Model): Props {
  return {
    data: model.data,
    links: model.links,
    params: model.params
  }
}

export function update (model: Model, msg: Msg): [Model, Cmd] {
  switch (msg.type) {
    case 'HTTP_REQUEST':
      return [{...model, isLoading: true, loadProgress: 0}, null]

    case 'HTTP_RESPONSE':
      if (msg.payload.readyState === 4) {
        return [{...model, isLoading: false, data: msg.body}, null]
      }

      if (msg.payload.readyState === 3 && msg.payload.bytesTotal > -1) {
        return [{...model, loadProgress: msg.payload.bytesLoaded / msg.payload.bytesTotal}, null]
      }

      return [model, null]

    default:
      console.log('Unhandled message:', msg)
      return [model, null]
  }
}

export function view (model: Model) {
  const {data, isLoading, links, loadProgress} = model

  if (isLoading || !data) {
    return (
      <div class={style.home}>
        {nav.view({links})}
        <div class={style.post__content}>Loading: {(loadProgress * 100).toFixed()}%</div>
      </div>
    )
  }

  return (
    <div class={style.home}>
      {nav.view({links})}
      <div class={style.home__content}>
        <h1>{data.title}</h1>
        <div>
          {data._embedded.postPreview.map(post => (
            <div>
              <a
                href={`/post/${post.id}`}
                on={{
                  click: {
                    type: 'HISTORY_PUSH_STATE',
                    preventDefault: true,
                    path: `/post/${post.id}`,
                    effect: {
                      type: 'POST_OPEN'
                    }
                  }
                }}
              >
                {post.title}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

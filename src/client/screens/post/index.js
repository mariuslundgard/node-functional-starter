// @flow

/** @jsx el */

import * as http from 'runtime-http'
// eslint-disable-next-line no-unused-vars
import {el} from 'vdom'
import style from './style.css'

// Import components
import * as backNav from '../../components/backNav'

import type {HttpGet, HttpRequest, HttpResponse} from 'runtime-http'
import type {Link, Post} from '../../../types'

type Params = {
  id: string
}

export type Props = {
  data?: Post,
  links: Link[],
  params: Params
}

export type Model = {
  data?: Post,
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

  return [
    {isLoading: true, links: props.links, loadProgress: 0, params: props.params},
    http.get(`/api/post/${props.params.id}`)
  ]
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

  if (!data || isLoading) {
    return (
      <div class={style.post}>
        {backNav.view({links})}
        <div class={style.post__content}>Loading: {(loadProgress * 100).toFixed()}%</div>
      </div>
    )
  }

  return (
    <div class={style.post}>
      {backNav.view({links})}
      <div class={style.post__content}>
        <h1>{data.title}</h1>
        <div innerHTML={`<p>${data.content.split('\n\n').join('</p></p>')}</p>`} />
      </div>
    </div>
  )
}

// @flow

/** @jsx el */

// eslint-disable-next-line no-unused-vars
import {el} from 'vdom'
import style from './style.css'

import type {Link} from '../../../types'

type Model = {
  links: Link[]
}

export function view (model: Model) {
  return (
    <div class={style.backNav}>
      <a href="/" on={{click: {type: 'HISTORY_PUSH_STATE', preventDefault: true, path: '/'}}}>
        Back
      </a>
    </div>
  )
}

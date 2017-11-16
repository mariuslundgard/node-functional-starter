// @flow

/** @jsx el */

import {bem} from 'bem'
// eslint-disable-next-line no-unused-vars
import {el} from 'vdom'
import style from './style.css'

import type {Link} from '../../../types'

type Model = {
  links: Link[]
}

export function view (model: Model) {
  return (
    <ol class={style.nav}>
      {model.links.map(link => (
        <li class={bem(style.nav__link, link.active && 'active')}>
          <a href={link.path} on={{click: {type: 'HISTORY_PUSH_STATE', preventDefault: true, path: link.path}}}>
            {link.label}
          </a>
        </li>
      ))}
    </ol>
  )
}

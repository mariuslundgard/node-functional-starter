// @flow

import {run} from 'runtime/browser'
import style from './style.css'
import './components/backNav/style.css'
import './components/nav/style.css'
import './screens/blog/style.css'
import './screens/home/style.css'
import './screens/post/style.css'

const rootElm = document.getElementById(style.root)
const raf = window.requestAnimationFrame

const effects = {
  POST_OPEN (effect, done) {
    const mainElm = document.querySelector(`.${style.main}`)

    if (mainElm) {
      const handleTransitionEnd = () => {
        mainElm.removeEventListener('transitionend', handleTransitionEnd)
        done()
        raf(() => {
          mainElm.classList.remove(`${style.main}--isTransitioning`)
          mainElm.classList.remove(`${style.main}--next`)
          // raf(() => raf(() => ))
        })
      }
      mainElm.addEventListener('transitionend', handleTransitionEnd)
      mainElm.classList.add(`${style.main}--isTransitioning`)
      setTimeout(() => mainElm.classList.add(`${style.main}--next`), 50)
    } else {
      done()
    }
  }
}

function setupPortHandlers (ports: any) {
  ports.effect.subscribe(msg => {
    if (effects[msg.effect.type]) {
      effects[msg.effect.type](msg.effect, () => ports.effectDone.send(msg.effect))
    } else {
      console.warn('Unknown effect:', msg.effect.type)
      ports.effectDone.send(msg.effect)
    }
  })

  ports.historyPushState.subscribe(msg => {
    history.pushState(null, document.title, msg.path)
  })

  window.onpopstate = () => {
    ports.historyPopState.send(location.pathname)
  }
}

if (rootElm) {
  const element: any | null = rootElm.firstChild
  const logger = {
    info: console.log,
    warn: console.warn,
    error: console.error
  }

  const workerUrl = rootElm.getAttribute('data-worker-url')
  const stateRaw = rootElm.getAttribute('data-state')

  if (!element) throw new Error('Missing element')
  if (!workerUrl) throw new Error('Missing worker URL')
  if (!stateRaw) throw new Error('Missing raw state')

  const props = JSON.parse(decodeURIComponent(stateRaw))

  console.log(props)

  run({
    element,
    logger,
    props,
    worker: new Worker(workerUrl)
  })
    .then(context => setupPortHandlers(context.ports))
    .catch(err => console.error(err.stack))
}

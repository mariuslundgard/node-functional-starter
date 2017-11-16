// @flow

import type {Batch} from './'

export default {
  BATCH (cmd: Batch, handleMsg: () => void, handleCmd: () => void, done?: () => void) {
    // console.log('BATCH', cmd)
    cmd.cmds.forEach(handleCmd)
    if (done) done()
  }
}

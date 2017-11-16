// @flow

export type Batch = {
  type: 'BATCH',
  cmds: any[]
}

export function batch (...cmds: any[]) {
  return {type: 'BATCH', cmds}
}

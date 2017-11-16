// @flow

export function bem (blockElement: string, ...modifiers: any[]) {
  return [blockElement].concat(modifiers.filter(Boolean).map(modifier => `${blockElement}--${modifier}`)).join(' ')
}

/* @flow */

export type <%= pascalEntityName %>Object = {
  id: number,
  value: string
}

export type <%= pascalEntityName %>StateObject = {
  state0: ?number,
  state1: boolean,
  state2: Array<number>,
  <%= camelEntityName %>: Array<<%= pascalEntityName %>Object>
}
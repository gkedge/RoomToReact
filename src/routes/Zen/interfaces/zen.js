/* @flow */

export type ZenObjectType = {
  id: number,
  value: string
}

export type ZenStateObjectType = {
  current: ?number,
  fetching: boolean,
  saved: Array<number>,
  zens: Array<ZenObjectType>
}
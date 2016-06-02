/* @flow */

import type { ZenObject, ZenStateObject } from '../interfaces/zen';
import 'whatwg-fetch'

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_ZEN      = 'REQUEST_ZEN'
export const RECEIVE_ZEN      = 'RECEIVE_ZEN'
export const SAVE_CURRENT_ZEN = 'SAVE_CURRENT_ZEN'

// ------------------------------------
// Actions
// ------------------------------------

export function requestZen (): any {
  return {
    type: REQUEST_ZEN
  }
}

let availableId = 0
export function receiveZen (value: string): any {
  return {
    type: RECEIVE_ZEN,
    payload: {
      value,
      id: availableId++
    }
  }
}

export function saveCurrentZen (): any {
  return {
    type: SAVE_CURRENT_ZEN
  }
}

export const fetchZen = (): Function => {
  // return (dispatch: Function): Promise => {
  return (dispatch: Function) => {
    dispatch(requestZen())

    return fetch('https://api.github.com/zen')
      .then(data => data.text())
      .then(text => dispatch(receiveZen(text)))
  }
}

export const actions = {
  requestZen,
  receiveZen,
  fetchZen,
  saveCurrentZen
}

const ZEN_ACTION_HANDLERS = {
  [REQUEST_ZEN]: (state: ZenStateObject): ZenStateObject => {
    return ({ ...state, fetching: true })
  },
  [RECEIVE_ZEN]: (state: ZenStateObject, action: {payload: ZenObject}): ZenStateObject => {
    return ({ ...state, zens: state.zens.concat(action.payload), current: action.payload.id, fetching: false })
  },
  [SAVE_CURRENT_ZEN]: (state: ZenStateObject): ZenStateObject => {
    return state.current != null ? ({ ...state, saved: state.saved.concat(state.current) }) : state
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState: ZenStateObject = { fetching: false, current: null, zens: [], saved: [] }
export default function zenReducer (state: ZenStateObject = initialState, action: any): ZenStateObject {
  const handler = ZEN_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

/* @flow */

import type {ZenObjectType, ZenStateObjectType} from '../interfaces/zen'
import type { ActionPayloadType } from 'reusable/interfaces/FpngTypes'
import 'whatwg-fetch'

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_ZEN = 'REQUEST_ZEN'
export const REQUEST_ZEN_ERROR = 'REQUEST_ZEN_ERROR'
export const RECEIVE_ZEN = 'RECEIVE_ZEN'
export const SAVE_CURRENT_ZEN = 'SAVE_CURRENT_ZEN'

// ------------------------------------
// Actions
// ------------------------------------

export function requestZen():any {
  return {
    type: REQUEST_ZEN
  }
}

export function requestZenError():any {
  return {
    type: REQUEST_ZEN_ERROR
  }
}

let availableId = 0
export function testOnlyModuleReset() {
  availableId = 0
}
export function receiveZen(value:string):ActionPayloadType {
  return {
    type:    RECEIVE_ZEN,
    payload: {
      value,
      id: availableId++
    }
  }
}

export function saveCurrentZen():ActionPayloadType {
  return {
    type: SAVE_CURRENT_ZEN
  }
}

export const fetchZen = ():Function => {
  // return (dispatch: Function): Promise => {
  return (dispatch:Function):any /* Promise */ => {
    dispatch(requestZen())

    return fetch('https://api.github.com/zen')
      .then((data:Object):any /* Promise*/ => data.text())
      .then((text:string):any /* Promise*/ => dispatch(receiveZen(text)))
      .catch((error:Error) => {
        dispatch(requestZenError())
        throw error
      })
  }
}

export const actions = {
  requestZen,
  receiveZen,
  fetchZen,
  saveCurrentZen
}

const ZEN_ACTION_HANDLERS = {
  [REQUEST_ZEN]: (state:ZenStateObjectType):ZenStateObjectType => {
    return ({...state, fetching: true})
  },
  [RECEIVE_ZEN]: (state:ZenStateObjectType, action:{payload: ZenObjectType}):ZenStateObjectType => {
    return ({
      ...state,
      zens:     state.zens.concat(action.payload),
      current:  action.payload.id, 
      fetching: false
    })
  },
  [REQUEST_ZEN_ERROR]: (state:ZenStateObjectType, action:{payload: ZenObjectType}):ZenStateObjectType => {
    return ({
      ...state,
      zens      : state.zens.concat(action.payload),
      fetching  : false,
      fetchError: true
    })
  },
  [SAVE_CURRENT_ZEN]: (state:ZenStateObjectType):ZenStateObjectType => {
    return state.current != null
      ? ({...state, saved: state.saved.concat(state.current)}) : state
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState:ZenStateObjectType = {fetching: false, fetchError: false, current: null, zens: [], saved: []}
export default function zenReducer(state:ZenStateObjectType = initialState,
                                   action:ActionPayloadType):ZenStateObjectType {
  const handler = ZEN_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

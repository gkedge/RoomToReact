/* @flow */

import type {ActionPayloadType} from 'reusable/interfaces/FpngTypes'

// ------------------------------------
// Constants
// ------------------------------------
export const COUNTER_INCREMENT = 'COUNTER_INCREMENT'

// ------------------------------------
// Actions
// ------------------------------------
export function increment(value:number = 1):ActionPayloadType {
  return {
    type:    COUNTER_INCREMENT,
    payload: value
  }
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk!

    NOTE: This is solely for demonstration purposes. In a real application,
    you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
    reducer take care of this logic.  */

export const doubleAsync = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    return new Promise((resolve:Function) => {
      setTimeout(() => {
        dispatch(increment(getState().counter))
        resolve()
      }, 200)
    })
  }
}

export const actions = {
  increment,
  doubleAsync
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [COUNTER_INCREMENT]: (state:number, action:ActionPayloadType):number => state + action.payload
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = 0
export default function counterReducer(state:number = initialState, action:Object):number {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

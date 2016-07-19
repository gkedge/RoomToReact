/* @ flow */
// http://redux.js.org/docs/recipes/ReducingBoilerplate.html: Generating Reducers

import type {
  ActionPayloadType,
  StateMapType,
  MapActionNameToCreatorFuctType
} from 'reusable/interfaces/FpngTypes'

export const unknownAction:ActionPayloadType = {
  type: "Unknown"
}

export function createReducer(initialState:StateMapType,
                              handlers:MapActionNameToCreatorFuctType):Function {
  return function reducer(state:StateMapType = initialState,
                          action:ActionPayloadType = unknownAction) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    }
    else {
      return state
    }
  }
}

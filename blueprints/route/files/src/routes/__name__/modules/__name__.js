/* @flow */
// https://davidwalsh.name/fetch
import fetch from 'isomorphic-fetch'

import type { <%= pascalEntityName %>Object, <%= pascalEntityName %>StateObject } from '../interfaces/<%= camelEntityName %>.js'

// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_<%= snakeEntityName %> = 'REQUEST_<%= snakeEntityName %>'
export const RECIEVE_<%= snakeEntityName %> = 'RECIEVE_<%= snakeEntityName %>'
export const SAVE_CURRENT_<%= snakeEntityName %> = 'SAVE_CURRENT_<%= snakeEntityName %>'

// ------------------------------------
// Actions
// ------------------------------------

export function request<%= pascalEntityName %>(): Action {
  return {
    type: REQUEST_<%= snakeEntityName %>
  }
}

let availableId = 0
export function receive<%= pascalEntityName %>(value: string): Action {
  return {
    type: RECIEVE_<%= snakeEntityName %>,
    payload: {
      value,
      id: availableId++
    }
  }
}

export function saveCurrent<%= pascalEntityName %>(): Action {
  return {
    type: SAVE_CURRENT_<%= snakeEntityName %>
  }
}

export const fetch<%= pascalEntityName %> = (): Function => {
  return (dispatch: Function): Promise => {
    dispatch(request<%= pascalEntityName %>())

    return fetch('https://api.github.com/zen')
      .then(data => data.text())
      .then(text => dispatch(receive<%= pascalEntityName %>(text)))
  }
}

export const actions = {
  request<%= pascalEntityName %>,
  receive<%= pascalEntityName %>,
  fetch<%= pascalEntityName %>,
  saveCurrent<%= pascalEntityName %>
}

const <%= snakeEntityName %>_ACTION_HANDLERS = {
  [REQUEST_<%= snakeEntityName %>]: (state: <%= pascalEntityName %>StateObject): <%= pascalEntityName %>StateObject => {
    return ({ ...state, fetching: true })
  },
  [RECIEVE_<%= snakeEntityName %>]: (state: <%= pascalEntityName %>StateObject, action: {payload: <%= pascalEntityName %>Object}): <%= pascalEntityName %>StateObject => {
    return ({ ...state, <%= camelEntityName %>s: state.<%= camelEntityName %>s.concat(action.payload), current: action.payload.id, fetching: false })
  },
  [SAVE_CURRENT_<%= snakeEntityName %>]: (state: <%= pascalEntityName %>StateObject): <%= pascalEntityName %>StateObject => {
    return state.current != null ? ({ ...state, saved: state.saved.concat(state.current) }) : state
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

const initialState: <%= pascalEntityName %>StateObject = { fetching: false, current: null, <%= camelEntityName %>s: [], saved: [] }
export default function <%= camelEntityName %>Reducer (state: <%= pascalEntityName %>StateObject = initialState, action: Action): <%= pascalEntityName %>StateObject {
  const handler = <%= snakeEntityName %>_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
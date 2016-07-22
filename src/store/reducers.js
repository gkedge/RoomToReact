// Described by Dan Abramov here: http://stackoverflow.com/a/33044701
// to dynamically add route-specific JS/CSS/etc. See ./createStore.js

import { combineReducers } from 'redux'
import { routerReducer as router } from 'react-router-redux'
import systemError from 'reusable/modules/SystemError/modules/SystemErrorMod'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    // Add sync reducers here
    router,
    systemError,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (!store.asyncReducers[key]) {
    store.asyncReducers[key] = reducer
    store.replaceReducer(makeRootReducer(store.asyncReducers))
  }
}

export default makeRootReducer

/*
Described by Dan Abramov here: http://stackoverflow.com/a/33044701
 */

import { injectReducer } from '../../store/reducers'


export default (store) => ({
  path: 'load',
  getComponent(nextState, next) {
    require.ensure([
      './containers/LoadRefundRequestContainer',
      './modules/LoadRefundRequestMod'
    ], (require) => {
      const LoadRefundRequestContainer = require('./containers/LoadRefundRequestContainer').default
      const loadRefundRequestReducer = require('./modules/LoadRefundRequestMod').default

      // The key is only significant in that it ensures uniqueness of
      // reducers when dynamically combineReducers. It can be any unique value
      // to your app; it doesn't have any significance to the name of the path
      // or the webpack bundle name.
      injectReducer(store, {
        key:     'loadRefundRequest',
        reducer: loadRefundRequestReducer
      })
 
      next(null, LoadRefundRequestContainer)
    }, 'loadRefundRequest' /* Webpack named bundle */)
  }
})

import { injectReducer } from '../../store/reducers'


export default (store) => ({
  path: 'load',
  getComponent(nextState, next) {
    require.ensure([
      './containers/LoadRefundRequestContainer',
      './modules/LoadRefundRequestMod'
    ], (require) => {
      const LoadRefundRequest = require('./containers/LoadRefundRequestContainer').default
      const loadRefundRequestReducer = require('./modules/LoadRefundRequestMod').default

      injectReducer(store, {
        key:     'loadRefundRequest',
        reducer: loadRefundRequestReducer
      })
 
      next(null, LoadRefundRequest)
    }, 'loadRefundRequest' /* Webpack named bundle */)
  }
})

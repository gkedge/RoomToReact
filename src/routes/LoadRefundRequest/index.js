import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'loadRefundRequest',
  getComponent(nextState, next) {
    require.ensure([
      // './containers/loadRefundRequestContainer',
      './modules/loadRefundRequest'
    ], (require) => {
      const LoadRefundRequest = undefined // require('./containers/LoadRefundRequestContainer').default
      const loadRefundRequestReducer = require('./modules/loadRefundRequest').default

      injectReducer(store, {
        key:     'loadRefundRequest',
        reducer: loadRefundRequestReducer
      })

      next(null, LoadRefundRequest)
    }, 'loadRefundRequest' /* Webpack named bundle */)
  }
})
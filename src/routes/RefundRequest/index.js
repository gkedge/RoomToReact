import {injectReducer} from '../../store/reducers'
import {reducer as formReducer} from 'redux-form'

export default (store) => ({
  path: 'load',
  getComponent(nextState, next) {
    require.ensure([
      './containers/RefundRequestContainer',
      './modules/RefundRequestMod'
    ], (require) => {
      const RefundRequest = require('./containers/RefundRequestContainer').default
      const refundRequestReducer = require('./modules/RefundRequestMod').default

      injectReducer(store, {
        key:     'refundRequest',
        reducer: refundRequestReducer
      })

      injectReducer(store, {
        key:     'form',
        reducer: formReducer
      })

      next(null, RefundRequest)
    }, 'refundRequest' /* Webpack named bundle */)
  }
})

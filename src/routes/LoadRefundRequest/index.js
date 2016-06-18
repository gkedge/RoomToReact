import {injectReducer} from '../../store/reducers'
import {reducer as formReducer} from 'redux-form'

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

      injectReducer(store, {
        key:     'form',
        reducer: formReducer
      })

      next(null, LoadRefundRequest)
    }, 'loadRefundRequest' /* Webpack named bundle */)
  }
})

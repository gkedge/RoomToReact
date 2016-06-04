import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: 'zen',
  getComponent(nextState, cb) {
    require.ensure([
      './containers/ZenContainer',
      './modules/zen'
    ], (require) => {
      const Zen = require('./containers/ZenContainer').default
      const zenReducer = require('./modules/zen').default

      injectReducer(store, { key: 'zen', reducer: zenReducer })

      cb(null, Zen)
    }, 'zen' /* Webpack named bundle */)
  }
})
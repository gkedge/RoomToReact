import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: '<%= dashesEntityName %>',
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const <%= pascalEntityName %> = require('./containers/<%= pascalEntityName %>Container').default
      const <%= camelEntityName %>Reducer = require('./modules/<%= camelEntityName %>').default

      injectReducer(store, {
        key: '<%= camelEntityName %>',
        reducer: <%= camelEntityName %>Reducer
      })

      /*  Return getComponent   */
      cb(null, <%= pascalEntityName %>)

    /* Webpack named bundle   */
    }, '<%= pascalEntityName %>')
  }
})

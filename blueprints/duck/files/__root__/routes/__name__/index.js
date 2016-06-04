import { injectReducer } from '../../store/reducers'

export default (store) => ({
  path: '<%= camelEntityName %>',
  getComponent(nextState, next) {
    require.ensure([
      './containers/<%= pascalEntityName %>Container',
      './modules/<%= camelEntityName %>'
    ], (require) => {
      const <%= pascalEntityName %> = require('./containers/<%= pascalEntityName %>Container').default
      const <%= camelEntityName %>Reducer = require('./modules/<%= camelEntityName %>').default

      injectReducer(store, {
        key: '<%= camelEntityName %>',
        reducer: <%= camelEntityName %>Reducer
      })

      next(null, <%= pascalEntityName %>)
    })
  }
})
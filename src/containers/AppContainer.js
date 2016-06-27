/* @flow */

import React from 'react'
import { Router } from 'react-router'
import { Provider } from 'react-redux'

class AppContainer extends React.Component {
  static propTypes = {
    history:   React.PropTypes.object.isRequired,
    routerKey: React.PropTypes.number,
    routes:    React.PropTypes.object.isRequired,
    store:     React.PropTypes.object.isRequired
  }
  render():Object {
    const { history, routes, routerKey, store } = this.props

    return (
      <Provider store={store}>
        <div style={{ height: '100%' }}>
          <Router history={history} children={routes} key={routerKey} />
        </div>
      </Provider>
    )
  }
}
AppContainer.displayName = 'AppContainer'
export default AppContainer

// Testing the connected component:
// http://stackoverflow.com/a/36890932
// https://www.pluralsight.com/courses/react-redux-react-router-es6

import React from 'react'
import Zen from 'routes/Zen/components/Zen'
import ZenContainer from 'routes/Zen/containers/ZenContainer'
import {actions, testOnlyModuleReset} from 'routes/Zen/modules/zen'
import configureMockStore from 'redux-mock-store';
import {initialState} from 'routes/Zen/modules/zen'
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {useRouterHistory} from 'react-router'
import fetchMock from 'fetch-mock'

// Use the same middleware you use with Redux's applyMiddleware
const browserHistory = useRouterHistory(createBrowserHistory)()
const middleware = [thunk, routerMiddleware(browserHistory)]
const mockStore = configureMockStore(middleware)

describe('(Container) ZenContainer', () => {

  let store = null

  beforeEach(() => {
    // Setup the entire state, not just the part Redux passes
    // to the connected component.
    store = mockStore({
      fetching: false, current: null, zens: [], saved: []
    })
  })

  afterEach(() => {
    testOnlyModuleReset()
  })

  it('Zen & ZenContainer should exist', () => {
    expect(Zen).to.not.be.null
    expect(ZenContainer).to.not.be.null
  })

  describe('Test react-redux connect() actions', () => {
    it('Test react-redux connect()\'ed store with requestZen action.', () => {
      const requestZenAction = actions.requestZen()
      store.dispatch(requestZenAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([requestZenAction])
    })

    it('Test react-redux connect()\'ed store with requestZen action.', () => {
      const receiveZenAction = actions.receiveZen('Yow')
      store.dispatch(receiveZenAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([receiveZenAction])
    })

    it('Test react-redux connect()\'ed store with saveCurrentZen action.', () => {
      const saveCurrentZenAction = actions.saveCurrentZen()
      store.dispatch(saveCurrentZenAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([saveCurrentZenAction])
    })

    it('Test react-redux connect()\'ed store with fetchZen action.', () => {
      fetchMock.mock('https://api.github.com/zen', 'GET', 'I like turtles!')

      // Return the promise to handle error
      return store.dispatch(actions.fetchZen())
        .then(data => {
          testOnlyModuleReset()
          var receiveZen = actions.receiveZen('I like turtles!')
          expect(data).to.be.eql(receiveZen)
          const mockedActions = store.getActions()
          expect(mockedActions).to.be.eql([actions.requestZen(), receiveZen])
        })
    })
  })
})

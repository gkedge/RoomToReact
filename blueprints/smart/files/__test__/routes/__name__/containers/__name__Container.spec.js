// Testing the connected component:
// http://stackoverflow.com/a/36890932

import React from 'react'
import <%= pascalEntityName %> from 'routes/<%= pascalEntityName %>/components/<%= pascalEntityName %>'
import <%= pascalEntityName %>Container from 'routes/<%= pascalEntityName %>/containers/<%= pascalEntityName %>/<%= pascalEntityName %>/Container'
import {actions, testOnlyModuleReset} from 'routes/<%= pascalEntityName %>/modules/<%= camelEntityName %>'
import configureMockStore from 'redux-mock-store';
import {initialState} from 'routes/<%= pascalEntityName %>/modules/<%= camelEntityName %>'
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {useRouterHistory} from 'react-router'
import fetchMock from 'fetch-mock'

// Use the same middleware you use with Redux's applyMiddleware
const browserHistory = useRouterHistory(createBrowserHistory)()
const middleware = [thunk, routerMiddleware(browserHistory)]
const mockStore = configureMockStore(middleware);

describe('(Container) <%= pascalEntityName %>Container', () => {
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

  it('<%= pascalEntityName %> & <%= pascalEntityName %>Container should exist', () => {
    expect(<%= pascalEntityName %>).to.not.be.null
    expect(<%= pascalEntityName %>Container).to.not.be.null
  })

  describe('Test react-redux connect()', () => {

    it('Test react-redux connect()\'ed store.', () => {
      const wrapper = mount(
        <Provider store={store}>
          <<%= pascalEntityName %>
            <%= camelEntityName %>={null}
            saved={[]}
            fetch<%= pascalEntityName %>={fetch<%= pascalEntityName %>}
            saveCurrent<%= pascalEntityName %>={saveCurrent<%= pascalEntityName %>}
          />
          </Provider>
        )

      // enzyme
      const propsFromRedux<%= pascalEntityName %> = wrapper.find(<%= pascalEntityName %>).props()

      expect(propsFromRedux<%= pascalEntityName %>).to.be.eql({
        <%= camelEntityName %>: null,
        saved: [],
        fetch<%= pascalEntityName %>:  fetch<%= pascalEntityName %>,
        saveCurrent<%= pascalEntityName %>: saveCurrent<%= pascalEntityName %>
    })
  })

  describe('Test react-redux connect() actions', () => {
    it('Test react-redux connect()\'ed store with request<%= pascalEntityName %> action.', () => {
      const request<%= pascalEntityName %>Action = actions.request<%= pascalEntityName %>()
      store.dispatch(request<%= pascalEntityName %>Action)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([request<%= pascalEntityName %>Action])
    })

    it('Test react-redux connect()\'ed store with request<%= pascalEntityName %> action.', () => {
      const receive<%= pascalEntityName %>Action = actions.receive<%= pascalEntityName %>('Yow')
      store.dispatch(receive<%= pascalEntityName %>Action)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([receive<%= pascalEntityName %>Action])
    })

    it('Test react-redux connect()\'ed store with saveCurrent<%= pascalEntityName %> action.', () => {
      const saveCurrent<%= pascalEntityName %>Action = actions.saveCurrent<%= pascalEntityName %>()
      store.dispatch(saveCurrent<%= pascalEntityName %>Action)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([saveCurrent<%= pascalEntityName %>Action])
    })

    it('Test react-redux connect()\'ed store with fetchZen action.', () => {
      fetchMock.mock('https://api.github.com/zen', 'GET', 'I like turtles!')

      // Return the promise to handle error
      return store.dispatch(actions.fetch<%= pascalEntityName %>()).then(data => {
      testOnlyModuleReset()
      var receive<%= pascalEntityName %> = actions.receive<%= pascalEntityName %>('I like turtles!')
      expect(data).to.be.eql(receive<%= pascalEntityName %>)
      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([actions.request<%= pascalEntityName %>(), receive<%= pascalEntityName %>])
    })
  })
  })
})

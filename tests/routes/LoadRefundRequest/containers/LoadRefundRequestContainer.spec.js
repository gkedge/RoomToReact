// Testing the connected component:
// http://stackoverflow.com/a/36890932

import React from 'react'
import LoadRefundRequest from 'routes/LoadRefundRequest/components/LoadRefundRequest'
import LoadRefundRequestContainer from 'routes/LoadRefundRequest/containers/LoadRefundRequestContainer'
import {actions, initialState} from 'routes/LoadRefundRequest/modules/LoadRefundRequestMod'
import configureMockStore from 'redux-mock-store';
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {useRouterHistory} from 'react-router'
import url from 'url'
import fetchMock from 'fetch-mock'
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
   
// Use the same middleware you use with Redux's applyMiddleware
const browserHistory = useRouterHistory(createBrowserHistory)()
const middleware = [thunk, routerMiddleware(browserHistory)]
const mockStore = configureMockStore(middleware)

describe('(Container) LoadRefundRequestContainer', () => {
  let store = null

  beforeEach(() => {
    // Setup the entire state, not just the part Redux passes
    // to the connected component.
    store = mockStore({
      fetching: false, current: null, zens: [], saved: []
    })
  })

  it('LoadRefundRequest & LoadRefundRequestContainer should exist', () => {
    expect(LoadRefundRequest).to.not.be.null
    expect(LoadRefundRequestContainer).to.not.be.null
  })

  // describe('Test react-redux connect()', () => {
  //
  //   it('Test react-redux connect()\'ed store.', () => {
  //     const wrapper = mount(
  //       <Provider store={store}>
  //         <LoadRefundRequest
  //           loadRefundRequest={null}
  //           saved={[]}
  //           fetchLoadRefundRequest={fetchLoadRefundRequest}
  //           saveCurrentLoadRefundRequest={saveCurrentLoadRefundRequest}
  //         />
  //       </Provider>
  //     )
  //
  //     // enzyme
  //     const propsFromReduxLoadRefundRequest = wrapper.find(LoadRefundRequest).props()
  //
  //     expect(propsFromReduxLoadRefundRequest).to.be.eql({
  //       loadRefundRequest           : null,
  //       saved                       : [],
  //       fetchLoadRefundRequest      : fetchLoadRefundRequest,
  //       saveCurrentLoadRefundRequest: saveCurrentLoadRefundRequest
  //     })
  //   })
  // })

  describe('Test react-redux connect() actions', () => {
    it('Test react-redux connect()\'ed store with requestLoadRefundRequest action.', () => {
      const requestLoadRefundRequestAction = actions.requestLoadRefundRequest(url.parse('http://localhost/foo.pdf'))
      store.dispatch(requestLoadRefundRequestAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([requestLoadRefundRequestAction])
    })

    it('Test react-redux connect()\'ed store with requestLoadRefundRequest action.', () => {
      const receiveLoadRefundRequestAction = actions.receiveLoadRefundRequest('Yow')
      store.dispatch(receiveLoadRefundRequestAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([receiveLoadRefundRequestAction])
    })

    it('Test react-redux connect()\'ed store with postLoadRefundRequest action.', () => {
      const postLoadRefundRequestAction = actions.postLoadRefundRequest()
      store.dispatch(postLoadRefundRequestAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([postLoadRefundRequestAction])
    })

    it('Test react-redux connect()\'ed store with savedLoadRefundRequest action.', () => {
      const savedLoadRefundRequestAction = actions.savedLoadRefundRequest()
      store.dispatch(savedLoadRefundRequestAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([savedLoadRefundRequestAction])
    })

    it('Test react-redux connect()\'ed store with fetchRefundRequestFile action.', () => {
      
      let pdfFilePath =  url.parse('http://localhost/foo.pdf')
      
      fetchMock.mock(pdfFilePath.format(), 'GET', 'I like turtles!')

      // Return the promise to handle error
      return store.dispatch(actions.fetchRefundRequestFile(pdfFilePath))
        .then(data => {
          const receiveLoadRefundRequest = actions.receiveLoadRefundRequest('I like turtles!')
          expect(data).to.be.eql(receiveLoadRefundRequest)
          const mockedActions = store.getActions()
          expect(mockedActions).to.be.eql(
            [actions.requestLoadRefundRequest(pdfFilePath), receiveLoadRefundRequest])
        })
    })
  })
})

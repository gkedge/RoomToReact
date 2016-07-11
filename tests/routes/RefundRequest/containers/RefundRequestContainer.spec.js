// Testing the connected component:
// http://stackoverflow.com/a/36890932

import React from 'react'
import RefundRequest from 'routes/RefundRequest/components/RefundRequest'
import RefundRequestContainer from 'routes/RefundRequest/containers/RefundRequestContainer'
import {actions, initialState} from 'routes/RefundRequest/modules/RefundRequestMod'
import configureMockStore from 'redux-mock-store';
import {routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {useRouterHistory} from 'react-router'
import url from 'url'
import fetchMock from 'fetch-mock'
import sinon from 'sinon';
import {mount, shallow} from 'enzyme';
import {base64ToBinary} from 'reusable/utilities/dataUtils'

// Use the same middleware you use with Redux's applyMiddleware
const browserHistory = useRouterHistory(createBrowserHistory)()
const middleware = [thunk, routerMiddleware(browserHistory)]
const mockStore = configureMockStore(middleware)

describe('(Route/Container) RefundRequest/RefundRequestContainer', () => {
  let store = null

  beforeEach(() => {
    // Setup the entire state, not just the part Redux passes
    // to the connected component.
    store = mockStore({
      fetching: false, current: null, zens: [], saved: []
    })
  })

  it('RefundRequest & RefundRequestContainer should exist', () => {
    expect(RefundRequest).to.not.be.null
    expect(RefundRequestContainer).to.not.be.null
  })

  // describe('Test react-redux connect()', () => {
  //
  //   it('Test react-redux connect()\'ed store.', () => {
  //     const wrapper = mount(
  //       <Provider store={store}>
  //         <RefundRequest
  //           refundRequest={null}
  //           saved={[]}
  //           fetchRefundRequest={fetchRefundRequest}
  //           saveCurrentRefundRequest={saveCurrentRefundRequest}
  //         />
  //       </Provider>
  //     )
  //
  //     // enzyme
  //     const propsFromReduxRefundRequest = wrapper.find(RefundRequest).props()
  //
  //     expect(propsFromReduxRefundRequest).to.be.eql({
  //       refundRequest           : null,
  //       saved                       : [],
  //       fetchRefundRequest      : fetchRefundRequest,
  //       saveCurrentRefundRequest: saveCurrentRefundRequest
  //     })
  //   })
  // })

  describe('Test react-redux connect() actions', () => {
    it('Test react-redux connect()\'ed store with loadingPdf action.', () => {
      const loadingPdfAction = actions.loadingPdf({})
      store.dispatch(loadingPdfAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([loadingPdfAction])
    })

    it('Test react-redux connect()\'ed store with pdfBinary action.', () => {
      const pdfBinaryAction = actions.pdfBinary(base64ToBinary('Yow'))
      store.dispatch(pdfBinaryAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([pdfBinaryAction])
    })

    it('Test react-redux connect()\'ed store with pdfLoaded action.', () => {
      const pdfLoadAction = actions.pdfLoaded()
      store.dispatch(pdfLoadAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([pdfLoadAction])
    })

    it('Test react-redux connect()\'ed store with postRefundRequest action.', () => {
      const postRefundRequestAction = actions.postRefundRequest()
      store.dispatch(postRefundRequestAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([postRefundRequestAction])
    })

    it('Test react-redux connect()\'ed store with savedRefundRequest action.', () => {
      const savedRefundRequestAction = actions.savedRefundRequest()
      store.dispatch(savedRefundRequestAction)

      const mockedActions = store.getActions()
      expect(mockedActions).to.be.eql([savedRefundRequestAction])
    })

    //it('Test react-redux connect()\'ed store with lookupReferencedData action.', () => {
    //  
    //  let pdfFilePath =  url.parse('http://localhost/foo.pdf')
    //  
    //  fetchMock.mock(pdfFilePath.format(), 'GET', 'I like turtles!')
    //
    //  // Return the promise to handle error
    //  return store.dispatch(actions.lookupReferencedData(pdfFilePath))
    //    .then(data => {
    //      const pdfBinary = actions.pdfBinary(base64ToBinary('I like turtles!'))
    //      expect(data).to.be.eql(pdfBinary)
    //      const mockedActions = store.getActions()
    //      expect(mockedActions).to.be.eql(
    //        [actions.pdfBinary(pdfFilePath), pdfBinary])
    //    })
    //})
  })
})

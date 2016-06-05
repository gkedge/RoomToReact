import loadRefundRequestReducer, {
  // Add action constants:
  REQUEST_LOAD_REFUND_REQUEST, RECEIVE_LOAD_REFUND_REQUEST,
  POST_REFUND_REQUEST, SAVED_REFUND_REQUEST,
  actions,
  initialState
} from 'routes/LoadRefundRequest/modules/LoadRefundRequestMod'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.
import fetchMock from 'fetch-mock'
import {atob, btoa} from 'abab'
import url from 'url'

describe('(Route Module) LoadRefundRequest', () => {
  describe('(Actions)', () => {
    it('Should export a constant REQUEST_LOAD_REFUND_REQUEST.', () => {
      expect(REQUEST_LOAD_REFUND_REQUEST).to.equal('REQUEST_LOAD_REFUND_REQUEST')
    })
    it('Should export a constant RECEIVE_LOAD_REFUND_REQUEST.', () => {
      expect(RECEIVE_LOAD_REFUND_REQUEST).to.equal('RECEIVE_LOAD_REFUND_REQUEST')
    })

    it('Should export a constant POST_REFUND_REQUEST.', () => {
      expect(POST_REFUND_REQUEST).to.equal('POST_REFUND_REQUEST')
    })

    it('Should export a constant SAVED_REFUND_REQUEST.', () => {
      expect(SAVED_REFUND_REQUEST).to.equal('SAVED_REFUND_REQUEST')
    })

    describe('(Action Creator) requestLoadRefundRequest', () => {
      it('Should be exported as a function.', () => {
        expect(actions.requestLoadRefundRequest).to.be.a('function')
      })
      
      it('Should return an action with type "REQUEST_LOAD_REFUND_REQUEST".', () => {
        const pdfFilePath = url.parse('http://localhost/foo.pdf');
        expect(actions.requestLoadRefundRequest(pdfFilePath))
          .to.have.property('type', REQUEST_LOAD_REFUND_REQUEST)
      })
    })

    describe('(Action Creator) receiveLoadRefundRequest', () => {
      it('Should be exported as a function.', () => {
        expect(actions.receiveLoadRefundRequest).to.be.a('function')
      })

      it('Should return an action with type "RECEIVE_LOAD_REFUND_REQUEST".', () => {
        expect(actions.receiveLoadRefundRequest('Yow'))
          .to.have.property('type', RECEIVE_LOAD_REFUND_REQUEST)
      })

      it('Should assign the first argument to the "payload.pdfContent" property.', () => {
        expect(actions.receiveLoadRefundRequest('Yow'))
          .to.have.property('payload').and.eql({isLoading: false, pdfContent: 'Yow'})
      })

      it('Should default the "payload.pdfContent" property to empty string.', () => {
        expect(actions.receiveLoadRefundRequest(''))
          .to.have.property('payload').and.eql({isLoading: false, pdfContent: ''})
      })
    })

    describe('(Action Creator) postLoadRefundRequest', () => {
      it('Should be exported as a function.', () => {
        expect(actions.postLoadRefundRequest).to.be.a('function')
      })

      it('Should return an action with type "POST_REFUND_REQUEST".', () => {
        expect(actions.postLoadRefundRequest())
          .to.have.property('type', POST_REFUND_REQUEST)
      })
    })

    describe('(Action Creator) savedLoadRefundRequest', () => {
      it('Should be exported as a function.', () => {
        expect(actions.savedLoadRefundRequest).to.be.a('function')
      })

      it('Should return an action with type "SAVED_REFUND_REQUEST".', () => {
        expect(actions.savedLoadRefundRequest())
          .to.have.property('type', SAVED_REFUND_REQUEST)
      })

      it('Should return an action with "payload.isSaving && payload.isSaved" properties.', () => {
        expect(actions.savedLoadRefundRequest())
          .to.have.property('payload').and.eql({isSaving: false, isSaved: true})
      })
    })

    describe('(Action Creator) fetchRefundRequestFile', () => {
      const file = url.parse('file://yow.pdf')
      let _globalState, _dispatchSpy, _getStateSpy

      beforeEach(() => {
        _globalState = {
          loadRefundRequest: loadRefundRequestReducer(undefined, {})
        }
        _dispatchSpy = sinon.spy((action) => {
          _globalState = {
            ..._globalState,
            loadRefundRequest: loadRefundRequestReducer(_globalState.loadRefundRequest, action)
          }
        })
        _getStateSpy = sinon.spy(() => {
          return _globalState
        })

        fetchMock.mock(file.format(), 'GET', 'I like turtles!')
      })

      afterEach(() => {
        fetchMock.restore()
      })

      it('Should be exported as a function.', () => {
        expect(actions.fetchRefundRequestFile).to.be.a('function')
      })

      it('Should return a function (is a thunk).', () => {
        expect(actions.fetchRefundRequestFile(file)).to.be.a('function')
      })

      it('Fetching fetchRefundRequestFile through store returns a Promise', () => {
        return expect(actions.fetchRefundRequestFile(file)(_dispatchSpy))
          .to.eventually.be.fulfilled
      })

      it('State after fetch contains fetchRefundRequestFile.', () => {
        return actions.fetchRefundRequestFile(file)(_dispatchSpy)
          .then(() => {
            expect(_dispatchSpy).to.have.been.calledTwice;
            expect(fetchMock.called(file.format())).to.be.true
            expect(_globalState.loadRefundRequest.pdfContent).to.equal('I like turtles!')
          })
      })
    })

    describe('(Action Creator) saveRefundRequest', () => {
      let _globalState, _dispatchSpy, _getStateSpy

      beforeEach(() => {
        _globalState = {
          loadRefundRequest: loadRefundRequestReducer(undefined, {})
        }
        _dispatchSpy = sinon.spy((action) => {
          _globalState = {
            ..._globalState,
            loadRefundRequest: loadRefundRequestReducer(_globalState.loadRefundRequest, action)
          }
        })
        _getStateSpy = sinon.spy(() => {
          return _globalState
        })

        fetchMock.mock('/refunds', 'POST', 'I like turtles!')
      })

      afterEach(() => {
        fetchMock.restore()
      })

      it('Should be exported as a function.', () => {
        expect(actions.saveRefundRequest).to.be.a('function')
      })

      it('Should return a function (is a thunk).', () => {
        expect(actions.saveRefundRequest('Yow')).to.be.a('function')
      })

      it('Fetching saveRefundRequest through store returns a Promise', () => {
        return expect(actions.saveRefundRequest('Yow')(_dispatchSpy))
          .to.eventually.be.fulfilled
      })

      it('State after fetch contains saveRefundRequest.', () => {
        return actions.saveRefundRequest('Yow')(_dispatchSpy)
          .then(() => {
            expect(_dispatchSpy).to.have.been.calledTwice;
            // TODO: expect(fetchMock.called('/refunds')).to.be.true
            // TODO: expect(_globalState.loadRefundRequest.loadRefundRequests[0].value).to.equal('I like turtles!')
          })
      })
    })

    // NOTE: Probably want to verify that state hasn't been mutated).
    describe('(Action Handler) basic reduce tests', () => {
      it('Should be a function.', () => {
        expect(loadRefundRequestReducer).to.be.a('function')
      })

      it('Should initialize with `initialState`.', () => {
        expect(loadRefundRequestReducer(undefined, {})).to.equal(initialState)
      })

      it('Passing `undefined` to reducer should produce initialState', () => {
        let state = loadRefundRequestReducer(undefined, {})
        expect(state).to.eql(initialState)
        state = loadRefundRequestReducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(initialState)
      })
    })

    describe('(Action Handler) LOAD_REFUND_REQUEST_ACTION_HANDLERS', () => {
      it('Passing `requestLoadRefundRequest()` to reducer should produce fetching truth', () => {
        const pdfFilePath = url.parse('http://localhost/foo.pdf')
        const expected = Object.assign({}, initialState)
        expected.isLoading = true;
        let state = loadRefundRequestReducer(initialState, actions.requestLoadRefundRequest(pdfFilePath))
        expect(state).to.eql(expected)
        state = loadRefundRequestReducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(expected)
      })
    })

    describe('(Action Handler) RECEIVE_LOAD_REFUND_REQUEST', () => {
      it('Passing `receiveLoadRefundRequest()` to reducer should produce PDF data', () => {
        const pdfFilePath = url.parse('http://localhost/foo.pdf')
        const expected = Object.assign({}, initialState)
        expected.pdfContent = 'Yow';
        let state = loadRefundRequestReducer(initialState, actions.requestLoadRefundRequest(pdfFilePath))
        state = loadRefundRequestReducer(state, actions.receiveLoadRefundRequest('Yow'))
        expect(state).to.eql(expected)
      })
    })

    describe('(Action Handler) POST_REFUND_REQUEST', () => {
      it('Passing `postLoadRefundRequest()` to reducer should produce...', () => {
        const pdfFilePath = url.parse('http://localhost/foo.pdf')
        const expected = Object.assign({}, initialState)
        expected.pdfContent = 'Yow';
        expected.isSaving = true;
        let state = loadRefundRequestReducer(initialState, actions.requestLoadRefundRequest(pdfFilePath))
        state = loadRefundRequestReducer(state, actions.receiveLoadRefundRequest('Yow'))
        state = loadRefundRequestReducer(state, actions.postLoadRefundRequest())

        expect(state).to.eql(expected)
      })
    })

    describe('(Action Handler) SAVED_REFUND_REQUEST', () => {
      it('Passing `savedLoadRefundRequest()` to reducer should produce...', () => {
        const pdfFilePath = url.parse('http://localhost/foo.pdf')
        const expected = Object.assign({}, initialState)
        expected.isSaved = true;
        let state = loadRefundRequestReducer(initialState, actions.requestLoadRefundRequest(pdfFilePath))
        state = loadRefundRequestReducer(state, actions.receiveLoadRefundRequest('Yow'))
        state = loadRefundRequestReducer(state, actions.postLoadRefundRequest())
        state = loadRefundRequestReducer(state, actions.savedLoadRefundRequest())

        expect(state).to.eql(expected)
      })
    })
  })
})

/* flow */

import type { ActionPayloadType } from 'reusable/interfaces/FpngTypes'

import type {
  LookupFormDataType,
  SaveRefundRequestPayloadType,
  LoadRefundRequestStateObjectType
} from 'routes/LoadRefundRequest/interfaces/LoadRefundRequestTypes'

import loadRefundRequestReducer, {
  // Add action constants:
  LOADING_PDF, PDF_BINARY, PDF_LOADED,
  POST_REFUND_REQUEST, SAVED_REFUND_REQUEST,
  actions,
  initialState
} from 'routes/LoadRefundRequest/modules/LoadRefundRequestMod'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.
import fetchMock from 'fetch-mock'
import {binary2Base64, base64ToBinary} from 'reusable/utilities/dataUtils'
import url from 'url'

describe('(Route/Module) LoadRefundRequest/LoadRefundRequestMod', () => {
  describe('Actions', () => {
    const pdfFile = {}

    describe('Actions Constants', () => {
      it('Should export a constant LOADING_PDF.', () => {
        expect(LOADING_PDF).to.equal('LOADING_PDF')
      })

      it('Should export a constant PDF_BINARY.', () => {
        expect(PDF_BINARY).to.equal('PDF_BINARY')
      })

      it('Should export a constant PDF_LOADED.', () => {
        expect(PDF_LOADED).to.equal('PDF_LOADED')
      })

      it('Should export a constant POST_REFUND_REQUEST.', () => {
        expect(POST_REFUND_REQUEST).to.equal('POST_REFUND_REQUEST')
      })

      it('Should export a constant SAVED_REFUND_REQUEST.', () => {
        expect(SAVED_REFUND_REQUEST).to.equal('SAVED_REFUND_REQUEST')
      })
    })

    describe('(Actions Creators)', () => {
      describe('loadingPdf', () => {
        it('Should be exported as a function.', () => {
          expect(actions.loadingPdf).to.be.a('function')
        })

        it('Should return an action with type "LOADING_PDF".', () => {
          expect(actions.loadingPdf({}))
            .to.have.property('type', LOADING_PDF)
        })

        it('Should assign the first argument to the "payload.pdfFile" property.', () => {
          expect(actions.loadingPdf({}))
            .to.have.property('payload').and.eql({isLoading: true, pdfFile: {}})
        })
      })

      describe('pdfBinary', () => {
        it('Should be exported as a function.', () => {
          expect(actions.pdfBinary).to.be.a('function')
        })

        it('Should return an action with type "PDF_BINARY".', () => {
          expect(actions.pdfBinary(base64ToBinary('Yow')))
            .to.have.property('type', PDF_BINARY)
        })

        it('Should assign the first argument to the "payload.pdfRaw" property.', () => {
          expect(actions.pdfBinary(base64ToBinary('Yow')))
            .to.have.property('payload').and.eql({pdfRaw: base64ToBinary('Yow')})
        })

        it('Should default the "payload.base64PDF" property to empty string.', () => {
          expect(actions.pdfBinary(base64ToBinary('')))
            .to.have.property('payload').and.eql({pdfRaw: base64ToBinary('')})
        })
      })

      describe('pdfLoaded', () => {
        it('Should be exported as a function.', () => {
          expect(actions.pdfLoaded).to.be.a('function')
        })

        it('Should return an action with type "PDF_LOADED".', () => {
          expect(actions.pdfLoaded())
            .to.have.property('type', PDF_LOADED)
        })

        it('Should assign the first argument to the "payload.isLoading" property.', () => {
          expect(actions.pdfLoaded())
            .to.have.property('payload').and.eql({isLoading: false})
        })
      })

      describe('postLoadRefundRequest', () => {
        it('Should be exported as a function.', () => {
          expect(actions.postLoadRefundRequest).to.be.a('function')
        })

        it('Should return an action with type "POST_REFUND_REQUEST".', () => {
          expect(actions.postLoadRefundRequest())
            .to.have.property('type', POST_REFUND_REQUEST)
        })
      })

      describe('savedLoadRefundRequest', () => {
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

      describe('fetchPaymentHistory', () => {
        const lookupFormData:LookupFormDataType = {
          referenceNum: '0123456',
          dateFrom: '2016-03-24',
          dateTo: '2016-06-15',
          email: 'devnull@gmail.com'
        }

        const filePath = url.parse('file://yow.pdf')
        let _globalState, _dispatchSpy, _getStateSpy

        beforeEach(() => {
          _globalState = {
            loadRefundRequest: loadRefundRequestReducer(undefined, undefined)
          }
          _dispatchSpy = sinon.spy((action:ActionPayloadType) => {
            _globalState = {
              ..._globalState,
              loadRefundRequest: loadRefundRequestReducer(_globalState.loadRefundRequest, action)
            }
          })
          _getStateSpy = sinon.spy(() => {
            return _globalState
          })

          fetchMock.mock(filePath.format(), 'GET', 'I like turtles!')
        })

        afterEach(() => {
          fetchMock.restore()
        })

        it('Should be exported as a function.', () => {
          expect(actions.fetchPaymentHistory).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.fetchPaymentHistory(filePath, lookupFormData)).to.be.a('function')
        })

        it('Fetching fetchPaymentHistory through store returns a Promise', () => {
          return expect(actions.fetchPaymentHistory(filePath, lookupFormData)(_dispatchSpy))
            .to.eventually.be.fulfilled
        })
        //
        //it('State after fetch contains fetchPaymentHistory.', () => {
        //  return actions.fetchPaymentHistory(file)(_dispatchSpy)
        //    .then(() => {
        //      expect(_dispatchSpy).to.have.been.calledOnce;
        //      expect(fetchMock.called(file.format())).to.be.true
        //      //expect(_globalState.loadRefundRequest.pdfContent).to.eql('I like turtles!')
        //    })
        //})
      })

      describe('saveRefundRequest', () => {
        let _globalState, _dispatchSpy, _getStateSpy

        beforeEach(() => {
          _globalState = {
            loadRefundRequest: loadRefundRequestReducer(undefined, undefined)
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
    })

    describe('Action Handlers', () => {

      // NOTE: Probably want to verify that state hasn't been mutated).
      describe('Basic reduce tests', () => {
        it('Should be a function.', () => {
          expect(loadRefundRequestReducer).to.be.a('function')
        })

        it('Should initialize with `initialState`.', () => {
          expect(loadRefundRequestReducer(undefined, undefined)).to.equal(initialState)
        })

        it('Passing unexpected action type to reducer should produce current or initial state', () => {
          let state = loadRefundRequestReducer(undefined, {type: 'Yow!'})
          expect(state).to.eql(initialState)
          state = loadRefundRequestReducer(state, {type: '@@@@@@@'})
          expect(state).to.eql(initialState)
        })
      })

      describe('Real Reducers', () => {
        const pdfBinaryData = base64ToBinary('Yow')

        it('Passing `loadingPdf()` to reducer should produce `loading` truth', () => {
          const expected = Object.assign({}, initialState)
          expected.isLoading = true;
          expected.pdf.file = {};
          let state = loadRefundRequestReducer(initialState, actions.loadingPdf({}))

          expect(state).to.eql(expected)
          state = loadRefundRequestReducer(state, {type: '@@@@@@@'})
          expect(state).to.eql(expected)
        })

        it('Passing `pdfBinary()` to reducer should produce PDF data', () => {
          const expected = Object.assign({}, initialState)
          expected.isLoading = true;
          expected.pdf.flie = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state = loadRefundRequestReducer(initialState, actions.loadingPdf({}))
          state = loadRefundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          expect(state).to.eql(expected)
        })

        it('Passing `pdfLoaded()` to reducer should produce PDF data', () => {
          const expected = Object.assign({}, initialState)
          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state = loadRefundRequestReducer(initialState, actions.loadingPdf({}))
          state = loadRefundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          state = loadRefundRequestReducer(state, actions.pdfLoaded())

          expect(state).to.eql(expected)
        })

        it('Passing `postLoadRefundRequest()` to reducer should produce...', () => {
          const expected = Object.assign({}, initialState)
          expected.pdf.flie = {}
          expected.pdf.binaryContent = pdfBinaryData
          expected.isSaving = true;
          let state = loadRefundRequestReducer(initialState, actions.loadingPdf({}))
          state = loadRefundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          state = loadRefundRequestReducer(state, actions.pdfLoaded())
          state = loadRefundRequestReducer(state, actions.postLoadRefundRequest())

          expect(state).to.eql(expected)
        })

        it('Passing `savedLoadRefundRequest()` to reducer should produce...', () => {
          const expected = Object.assign({}, initialState)
          expected.pdf.flie = {}
          expected.pdf.binaryContent = pdfBinaryData
          expected.isSaved = true;
          let state = loadRefundRequestReducer(initialState, actions.loadingPdf({}))
          state = loadRefundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          state = loadRefundRequestReducer(state, actions.pdfLoaded())
          state = loadRefundRequestReducer(state, actions.postLoadRefundRequest())
          state = loadRefundRequestReducer(state, actions.savedLoadRefundRequest())

          expect(state).to.eql(expected)
        })
      })
    })
  })
})

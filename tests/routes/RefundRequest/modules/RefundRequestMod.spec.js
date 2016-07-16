/* flow */

import type {ActionPayloadType} from 'reusable/interfaces/FpngTypes'

import type {
  LookupFormDataType,
  SaveRefundRequestPayloadType,
  RefundRequestStateObjectType
} from 'routes/RefundRequest/interfaces/RefundRequestTypes'

import refundRequestReducer, {
  // Add action constants:
  LOADING_PDF,
  LOOKUP_REFERENCED_DATA_START, LOOKUP_REFERENCED_DATA_LOADED,
  LOAD_NAMES_START, LOAD_NAMES_LOADED, LOAD_NAMES_ERROR,
  LOAD_ADDRESSES_START, LOAD_ADDRESSES_LOADED, LOAD_ADDRESSES_ERROR,
  LOAD_PAYMENT_HISTORY_DATA_START, LOAD_PAYMENT_HISTORY_DATA_LOADED, LOAD_PAYMENT_HISTORY_DATA_ERROR,
  PDF_BINARY, PDF_LOADED,
  PRE_RESET_REFUND_REQUEST_FORM, POST_RESET_REFUND_REQUEST_FORM,
  POST_REFUND_REQUEST, SAVED_REFUND_REQUEST,
  VALID_LOOKUP,
  CLEAR_ERROR_REPORT, RESET_STATE,
  actions,
  initialState
} from 'routes/RefundRequest/modules/RefundRequestMod'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.
import {
  get, post, put,
  getRootContext,
  setRootContext,
  responseFail
} from 'reusable/utilities/fluentRequest'
import fetchMock from 'fetch-mock'
import {reducerSpy} from '../../testRouterUtilities.spec'
import {binary2Base64, base64ToBinary} from 'reusable/utilities/dataUtils'
import url from 'url'
import cloneDeep from 'lodash/cloneDeep'

describe('(Route/Module) RefundRequest/RefundRequestMod', () => {
  describe('Actions', function () { // Can't use '() ==> here...
    this.timeout(200); // ... because this 'this' would be wrong.

    const paymentHistoryData = [
      {
        "version": 0,
        "items": [
          {
            "postingReferenceText": "0123456",
            "datePosted": "2016-03-17",
            "feeCode": "8001",
            "feeCodeDescription": "PRINTED COPY OF PATENT W/O COLOR, REGULAR SERVICE",
            "feeAmount": 3,
            "quantity": 1,
            "amount": 3,
            "mailRoomDate": "2016-03-17",
            "paymentMethodType": "DA500999"
          }
        ]
      }
    ]

    const namesData = [{"firstName": "Tommy", "lastName": "Turtle"}]
    const addressesData = [{
      addr0: '1010 Turtle St.',
      addr1: null,
      city: 'Ocean', state: 'World', zip: '11111'
    }]
    const lookupFormData:LookupFormDataType = {
      isError: false,
      isLookingUp: false,
      referenceNum: '0123456',
      dateFrom: '2016-03-24',
      dateTo: '2016-06-15',
      email: 'devnull@gmail.com'
    }
    const errorReport = {
      statusCode: 666,
      statusText: "Can't be gud..."
    }
    const pdfBinaryData:Uint8Array = base64ToBinary('Yow')

    const pdfFile = {}
    const baseAPI = 'http://unit-test'
    const paymentHistoryAPI =
      url.parse(baseAPI + '/paymentHistory/' + lookupFormData.referenceNum)
    const namesAPI = url.parse(baseAPI + '/name')
    const addressesAPI = url.parse(baseAPI + '/address')

    describe('Basic reduce tests', () => {
      it('Should be a function.', () => {
        expect(refundRequestReducer).to.be.a('function')
      })

      it('Should initialize with `initialState`.', () => {
        expect(refundRequestReducer(undefined, undefined)).to.equal(initialState)
      })

      it('Passing unexpected action type to reducer should produce current or initial state', () => {
        let state = refundRequestReducer(undefined, {type: 'Yow!'})
        expect(state).to.eql(initialState)
        state = refundRequestReducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(initialState)
      })
    })

    describe('PDF Actions', () => {
      describe('loadingPdf', () => {
        it('Should export a constant LOADING_PDF.', () => {
          expect(LOADING_PDF).to.equal('refund/RefundRequest/LOADING_PDF')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadingPdf).to.be.a('function')
        })

        it('Should return an action with type "LOADING_PDF".', () => {
          expect(actions.loadingPdf({}))
            .to.have.property('type', LOADING_PDF)
        })

        it('Should assign the first argument to the "payload.pdfFile" property.', () => {
          expect(actions.loadingPdf({}))
            .to.have.property('payload').and.eql({pdfFile: {}})
        })

        it('Passing `loadingPdf()` to reducer should produce `loading` truth', () => {
          const expected = cloneDeep(initialState)

          expected.pdf.isLoading = true;
          expected.pdf.file = {};
          let state = refundRequestReducer(initialState, actions.loadingPdf({}))

          expect(state).to.eql(expected)
        })
      })

      describe('pdfBinary', () => {
        it('Should export a constant PDF_BINARY.', () => {
          expect(PDF_BINARY).to.equal('refund/RefundRequest/PDF_BINARY')
        })
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

        it('Passing `pdfBinary()` to reducer should produce PDF data', () => {
          const expected = cloneDeep(initialState)

          expected.pdf.isLoading = true;
          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state = refundRequestReducer(initialState, actions.loadingPdf({}))
          state = refundRequestReducer(state, actions.pdfBinary(pdfBinaryData))

          expect(state).to.eql(expected)
        })
      })

      describe('pdfLoaded', () => {
        it('Should export a constant PDF_LOADED.', () => {
          expect(PDF_LOADED).to.equal('refund/RefundRequest/PDF_LOADED')
        })
        it('Should be exported as a function.', () => {
          expect(actions.pdfLoaded).to.be.a('function')
        })

        it('Should return an action with type "PDF_LOADED".', () => {
          expect(actions.pdfLoaded())
            .to.have.property('type', PDF_LOADED)
        })

        it('Passing `pdfLoaded()` to reducer should produce PDF data', () => {
          const expected = cloneDeep(initialState)

          expected.pdf.isLoading = false
          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state = refundRequestReducer(initialState, actions.loadingPdf({}))
          state = refundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          state = refundRequestReducer(state, actions.pdfLoaded())

          expect(state).to.eql(expected)
        })
      })
    })

    describe('Reset Refund Form Actions', () => {
      it('Should export a constant PRE_RESET_REFUND_REQUEST_FORM.', () => {
        expect(PRE_RESET_REFUND_REQUEST_FORM).to.equal('refund/RefundRequest/PRE_RESET_REFUND_REQUEST_FORM')
      })

      it('Should export a constant POST_RESET_REFUND_REQUEST_FORM.', () => {
        expect(POST_RESET_REFUND_REQUEST_FORM).to.equal('refund/RefundRequest/POST_RESET_REFUND_REQUEST_FORM')
      })

      // TODO: reset refund needs a thunk test like this validateLookup thunk test:
      // describe('validLookup thunk', () => {
      //   const stateHolder = {
      //     state: {
      //       refundRequest: cloneDeep(initialState)
      //     }
      //   }
      //   stateHolder.state.refundRequest.lookupForm = lookupFormData
      //
      //   const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
      //   let originalRootContext = null;
      //
      //   beforeEach(() => {
      //     originalRootContext = setRootContext('', url.parse(baseAPI))
      //   })
      //
      //   afterEach(() => {
      //     stateHolder.state.refundRequest = cloneDeep(initialState)
      //     dispatchSpy.reset()
      //     getStateSpy.reset()
      //     // mocking setup using fully configured request in fluentRequest.
      //     fetchMock.restore()
      //     setRootContext('', originalRootContext)
      //   })
      //
      //   it('Should be exported as a function.', () => {
      //     expect(actions.validLookup).to.be.a('function')
      //   })
      //
      //   it('Should return a function (is a thunk).', () => {
      //     expect(actions.validLookup(lookupFormData)).to.be.a('function')
      //   })
      //
      //   it('Running validLookup through store returns Promise.', () => {
      //     return expect(actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy))
      //       .to.eventually.be.fulfilled
      //   })
      //
      //   it('Test validLookup dispatch and all the dispatches it makes', () => {
      //     return actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy)
      //       .then(() => {
      //         expect(dispatchSpy).to.have.callCount(17)
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type:    VALID_LOOKUP,
      //           payload: lookupFormData
      //         })
      //         // Neither of these work to test if resetRefundRequestForm() has been called:
      //         // expect(dispatchSpy).to.have.been.calledWith(actions.resetRefundRequestForm)
      //         // expect(dispatchSpy).to.have.been.calledWith(() => {})
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: PRE_RESET_REFUND_REQUEST_FORM
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           meta: {form: "resetRefundRequestForm"},
      //           type: "redux-form/RESET"
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: POST_RESET_REFUND_REQUEST_FORM
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: LOOKUP_REFERENCED_DATA_START
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: LOAD_PAYMENT_HISTORY_DATA_START
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type:    LOAD_PAYMENT_HISTORY_DATA_LOADED,
      //           payload: paymentHistoryData
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: LOAD_NAMES_START
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type:    LOAD_NAMES_LOADED,
      //           payload: namesData
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: LOAD_ADDRESSES_START
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type:    LOAD_ADDRESSES_LOADED,
      //           payload: addressesData
      //         })
      //         expect(dispatchSpy).to.have.been.calledWithExactly({
      //           type: LOOKUP_REFERENCED_DATA_LOADED
      //         })
      //         // mocking setup using fully configured request in fluentRequest.
      //         expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
      //         expect(fetchMock.called(namesAPI.format())).to.be.true
      //         expect(fetchMock.called(addressesAPI.format())).to.be.true
      //       })
      //   })
      //
      //   it('State after validLookup contains lookupFormData, fees, names, addresses and entity types.', () => {
      //     const expected = cloneDeep(initialState)
      //     expected.lookupForm = cloneDeep(lookupFormData)
      //     expected.refundRequestForm.fees = paymentHistoryData
      //     expected.refundRequestForm.names = namesData
      //     expected.refundRequestForm.addresses = addressesData
      //     return actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy)
      //       .then(() => {
      //         expect(stateHolder.state.refundRequest).to.eql(expected)
      //       })
      //   })
      // })

    })

    describe('Payment History Actions', () => {

      describe('loadPaymentHistoryDataStart', () => {
        it('Should export a constant LOAD_PAYMENT_HISTORY_DATA_START.', () => {
          expect(LOAD_PAYMENT_HISTORY_DATA_START).to.equal('refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_START')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadPaymentHistoryDataStart).to.be.a('function')
        })

        it('Should return an action with type "LOAD_PAYMENT_HISTORY_DATA_STARTED".', () => {
          expect(actions.loadPaymentHistoryDataStart())
            .to.have.property('type', LOAD_PAYMENT_HISTORY_DATA_START)
        })

        it('Passing `loadPaymentHistoryDataStart()` to reducer should produce `loading` truth', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.isLoadingPaymentHistory = true;

          const state = refundRequestReducer(initialState, actions.loadPaymentHistoryDataStart())

          expect(state).to.eql(expected)
        })
      })

      describe('loadPaymentHistoryDataLoaded', () => {
        it('Should export a constant LOAD_PAYMENT_HISTORY_DATA_LOADED.', () => {
          expect(LOAD_PAYMENT_HISTORY_DATA_LOADED).to.equal('refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_LOADED')
        })
        it('Should be exported as a function.', () => {
          expect(actions.loadPaymentHistoryDataLoaded).to.be.a('function')
        })

        it('Should return an action with type "LOAD_PAYMENT_HISTORY_DATA_LOADED".', () => {
          expect(actions.loadPaymentHistoryDataLoaded(paymentHistoryData))
            .to.have.property('type', LOAD_PAYMENT_HISTORY_DATA_LOADED)
        })

        it('Should assign the first argument to `payload` property.', () => {
          expect(actions.loadPaymentHistoryDataLoaded(paymentHistoryData))
            .to.have.property('payload').and.eql(paymentHistoryData)
        })

        it('Passing `loadPaymentHistoryDataLoaded()` to reducer should produce payment history', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.fees = paymentHistoryData
          let state = refundRequestReducer(initialState, actions.loadPaymentHistoryDataStart())
          state = refundRequestReducer(state, actions.loadPaymentHistoryDataLoaded(paymentHistoryData))

          expect(state).to.eql(expected)
        })

      })

      describe('loadPaymentHistoryDataError', () => {
        it('Should export a constant LOAD_PAYMENT_HISTORY_DATA_ERROR.', () => {
          expect(LOAD_PAYMENT_HISTORY_DATA_ERROR).to.equal('refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_ERROR')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadPaymentHistoryDataError).to.be.a('function')
        })

        it('Should return an action with type "LOAD_PAYMENT_HISTORY_DATA_ERROR".', () => {
          expect(actions.loadPaymentHistoryDataError(errorReport))
            .to.have.property('type', LOAD_PAYMENT_HISTORY_DATA_ERROR)
        })

        it('Passing `loadPaymentHistoryDataError()` to reducer should produce `error` truth', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.isError = true;
          expected.refundRequestForm.errorReport = [cloneDeep(errorReport)]

          const state = refundRequestReducer(initialState,
            actions.loadPaymentHistoryDataError(errorReport))

          expect(state).to.eql(expected)
        })

      })

      describe('loadPaymentHistoryData', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = lookupFormData
        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
        let originalRootContext = null;

        beforeEach(() => {
          originalRootContext = setRootContext('', url.parse(baseAPI))
        })

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(initialState)
          stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData);
          stateHolder.state.refundRequest.refundRequestForm.fees = null;
          dispatchSpy.reset()
          getStateSpy.reset()
          fetchMock.restore() // mocking setup using fully configured request in fluentRequest.
          setRootContext('', originalRootContext)
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadPaymentHistoryData).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.loadPaymentHistoryData()).to.be.a('function')
        })

        it('Fetching loadPaymentHistoryData through store returns a Promise', () => {
          return expect(actions.loadPaymentHistoryData()(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Test loadPaymentHistoryData dispatch and all the dispatches it makes', () => {
          return actions.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWith({
                type: LOAD_PAYMENT_HISTORY_DATA_LOADED,
                payload: paymentHistoryData
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
            })
        })

        it('State after loadPaymentHistoryData contains fees.', () => {
          const expected = cloneDeep(initialState)
          expected.lookupForm = cloneDeep(lookupFormData)
          expected.refundRequestForm.fees = paymentHistoryData
          return actions.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
        })

        it('Test loadPaymentHistoryData dispatch with bad data (#1) and all the dispatches it makes', () => {
          fetchMock.restore()
          const response = {
            body:    "'yow!',",
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          }
          fetchMock.mock(paymentHistoryAPI.format(), 'GET', response)
          stateHolder.state.refundRequest.isNegativeTesting = true;
          return actions.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_ERROR,
                payload: {
                  statusCode: 700,
                  statusText: 'Bad data response'
                }
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
            })
        })

        it('Test loadPaymentHistoryData dispatch with bad data (#2) and all the dispatches it makes', () => {
          fetchMock.restore()
          const response = {
            body:    JSON.stringify("yow!"),
            headers: {
              'Content-Type': 'application/json; charset=utf-8'
            }
          }
          fetchMock.mock(paymentHistoryAPI.format(), 'GET', response)
          stateHolder.state.refundRequest.isNegativeTesting = true;
          return actions.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_ERROR,
                payload: {
                  statusCode: 700,
                  statusText: 'Bad data response'
                }
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
            })
        })
      })
    })

    describe('Name Actions', () => {

      describe('loadNamesDataStart', () => {

        it('Should export a constant LOAD_NAMES_START.', () => {
          expect(LOAD_NAMES_START).to.equal('refund/RefundRequest/LOAD_NAMES_START')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadNamesDataStart).to.be.a('function')
        })

        it('Should return an action with type "LOAD_NAMES_START".', () => {
          expect(actions.loadNamesDataStart())
            .to.have.property('type', LOAD_NAMES_START)
        })

        it('Passing `loadNamesDataStart()` to reducer should produce `loading` truth', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.isLoadingNames = true;

          const state = refundRequestReducer(initialState, actions.loadNamesDataStart())

          expect(state).to.eql(expected)
        })

      })

      describe('loadNamesDataLoaded', () => {
        const namesData = [{"firstName": "Tommy", "lastName": "Turtle"}]

        it('Should export a constant LOAD_NAMES_ERROR.', () => {
          expect(LOAD_NAMES_ERROR).to.equal('refund/RefundRequest/LOAD_NAMES_ERROR')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadNamesDataLoaded).to.be.a('function')
        })

        it('Should return an action with type "LOAD_NAMES_LOADED".', () => {
          expect(actions.loadNamesDataLoaded(namesData))
            .to.have.property('type', LOAD_NAMES_LOADED)
        })

        it('Should assign the first argument to `payload` property.', () => {
          expect(actions.loadNamesDataLoaded(namesData))
            .to.have.property('payload').and.eql(namesData)
        })

        it('Passing `loadNamesDataLoaded()` to reducer should produce names', () => {
          const namesData = [{"firstName": "Tommy", "lastName": "Turtle"}]
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.names = namesData

          let state = refundRequestReducer(initialState, actions.loadNamesDataStart())
          state = refundRequestReducer(state, actions.loadNamesDataLoaded(namesData))

          expect(state).to.eql(expected)
        })

      })

      describe('loadNamesDataError', () => {

        it('Should export a constant LOAD_NAMES_LOADED.', () => {
          expect(LOAD_NAMES_LOADED).to.equal('refund/RefundRequest/LOAD_NAMES_LOADED')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadNamesDataError).to.be.a('function')
        })

        it('Should return an action with type "LOAD_NAMES_ERROR".', () => {
          expect(actions.loadNamesDataError())
            .to.have.property('type', LOAD_NAMES_ERROR)
        })

        it('Passing `loadNamesDataError()` to reducer should produce `error` truth', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.name.isError = true;

          const state = refundRequestReducer(initialState, actions.loadNamesDataError())

          expect(state).to.eql(expected)
        })

      })

      describe('loadNamesData', () => {

        const stateHolder = {
          state: {
            refundRequest: cloneDeep(initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = lookupFormData
        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
        let originalRootContext = null;

        beforeEach(() => {
          originalRootContext = setRootContext('', url.parse(baseAPI))
        })

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(initialState)
          stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
          stateHolder.state.refundRequest.refundRequestForm.names = null
          dispatchSpy.reset()
          getStateSpy.reset()
          fetchMock.restore()  // mocking setup using fully configured request in fluentRequest.
          setRootContext('', originalRootContext)
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadNamesData).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.loadNamesData()).to.be.a('function')
        })

        it('Fetching loadNamesData through store returns a Promise', () => {
          return expect(actions.loadNamesData()(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Test loadNamesData dispatch and all the dispatches it makes', () => {
          return actions.loadNamesData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_LOADED,
                payload: namesData
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(namesAPI.format())).to.be.true
            })
        })

        it('State after loadNamesData contains list of names.', () => {
          const expected = cloneDeep(initialState)
          expected.lookupForm = cloneDeep(lookupFormData)
          expected.refundRequestForm.names = namesData
          return actions.loadNamesData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
        })

        it('Test loadNamesData dispatch with bad data (#1) and all the dispatches it makes', () => {
          fetchMock.restore()
          fetchMock.mock(namesAPI.format(), 'GET', "['yow!',]")
          stateHolder.state.refundRequest.isNegativeTesting = true;
          return actions.loadNamesData()(dispatchSpy, getStateSpy)
          // A catch below the 'then' below will catch failed expectations
          // instead of Errors raised by loadPaymentHistoryData. That would be
          // bad since an illuminating error message from the test wouldn't
          // produced for the 'expect' failures.
            .catch(() => {
              // Expect that any exception associated with a request is handled
              // without spreading the contagion.
              expect.fail()
            })
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_ERROR
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(namesAPI.format())).to.be.true
            })
        })

        it('Test loadNamesData dispatch with bad data (#2) and all the dispatches it makes', () => {
          fetchMock.restore()
          fetchMock.mock(namesAPI.format(), 'GET', JSON.stringify("yow!"))
          stateHolder.state.refundRequest.isNegativeTesting = true;
          return actions.loadNamesData()(dispatchSpy, getStateSpy)
          // A catch below the 'then' below will catch failed expectations
          // instead of Errors raised by loadPaymentHistoryData. That would be
          // bad since an illuminating error message from the test wouldn't
          // produced for the 'expect' failures.
            .catch(() => {
              // Expect that any exception associated with a request is handled
              // without spreading the contagion.
              expect.fail()
            })
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_ERROR
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(namesAPI.format())).to.be.true
            })
        })
      })
    })

    describe('Addresses Actions', () => {

      describe('loadAddressesDataStart', () => {
        it('Should export a constant LOAD_ADDRESSES_START.', () => {
          expect(LOAD_ADDRESSES_START).to.equal('refund/RefundRequest/LOAD_ADDRESSES_START')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadAddressesDataStart).to.be.a('function')
        })

        it('Should return an action with type "LOAD_ADDRESSES_START".', () => {
          expect(actions.loadAddressesDataStart())
            .to.have.property('type', LOAD_ADDRESSES_START)
        })

        it('Passing `loadAddressesDataStart()` to reducer should produce `loading` truth', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.isLoadingAddresses = true;

          const state = refundRequestReducer(initialState, actions.loadAddressesDataStart())

          expect(state).to.eql(expected)
        })

      })

      describe('loadAddressesDataLoaded', () => {
        it('Should export a constant LOAD_ADDRESSES_LOADED.', () => {
          expect(LOAD_ADDRESSES_LOADED).to.equal('refund/RefundRequest/LOAD_ADDRESSES_LOADED')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadAddressesDataLoaded).to.be.a('function')
        })

        it('Should return an action with type "LOAD_ADDRESSES_LOADED".', () => {
          expect(actions.loadAddressesDataLoaded(addressesData))
            .to.have.property('type', LOAD_ADDRESSES_LOADED)
        })

        it('Should assign the first argument to `payload` property.', () => {
          expect(actions.loadAddressesDataLoaded(addressesData))
            .to.have.property('payload').and.eql(addressesData)
        })

        it('Passing `loadAddressesDataError()` to reducer should produce `error` truth', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.address.isError = true;

          const state = refundRequestReducer(initialState, actions.loadAddressesDataError())

          expect(state).to.eql(expected)
        })

      })

      describe('loadAddressesDataError', () => {
        it('Should export a constant LOAD_ADDRESSES_ERROR.', () => {
          expect(LOAD_ADDRESSES_ERROR).to.equal('refund/RefundRequest/LOAD_ADDRESSES_ERROR')
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadAddressesDataError).to.be.a('function')
        })

        it('Should return an action with type "LOAD_ADDRESSES_ERROR".', () => {
          expect(actions.loadAddressesDataError())
            .to.have.property('type', LOAD_ADDRESSES_ERROR)
        })

        it('Passing `loadAddressesDataLoaded()` to reducer should produce addresses', () => {
          const expected = cloneDeep(initialState)
          expected.refundRequestForm.addresses = addressesData

          let state = refundRequestReducer(initialState, actions.loadAddressesDataStart())
          state = refundRequestReducer(state, actions.loadAddressesDataLoaded(addressesData))

          expect(state).to.eql(expected)
        })

      })

      describe('loadAddressesData', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = lookupFormData
        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
        let originalRootContext = null;

        beforeEach(() => {
          originalRootContext = setRootContext('', url.parse(baseAPI))
        })

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(initialState)
          stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
          stateHolder.state.refundRequest.refundRequestForm.addresses = null;
          dispatchSpy.reset()
          getStateSpy.reset()
          // mocking setup using fully configured request in fluentRequest.
          fetchMock.restore()
          setRootContext('', originalRootContext)
        })

        it('Should be exported as a function.', () => {
          expect(actions.loadAddressesData).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.loadAddressesData()).to.be.a('function')
        })

        it('Fetching loadAddressesData through store returns a Promise', () => {
          return expect(actions.loadAddressesData()(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Test loadAddressesData dispatch and all the dispatches it makes', () => {
          return actions.loadAddressesData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_LOADED,
                payload: addressesData
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(addressesAPI.format())).to.be.true
            })
        })

        it('State after loadAddressesData contains list of addresses.', () => {
          const expected = cloneDeep(initialState)
          expected.lookupForm = cloneDeep(lookupFormData)
          expected.refundRequestForm.addresses = addressesData
          return actions.loadAddressesData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
        })

        it('Test loadAddressesData dispatch with bad data (#1) and all the dispatches it makes', () => {
          fetchMock.restore()
          fetchMock.mock(addressesAPI.format(), 'GET', "['yow!',]")
          stateHolder.state.refundRequest.isNegativeTesting = true;
          return actions.loadAddressesData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_ERROR
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(addressesAPI.format())).to.be.true
            })
            .catch(() => {
              // Expect that any exception associated with a request is handled
              // without spreading the contagion.
              expect.fail()
            })
        })

        it('Test loadAddressesData dispatch with bad data (#2) and all the dispatches it makes', () => {
          fetchMock.restore()
          fetchMock.mock(addressesAPI.format(), 'GET', JSON.stringify("yow!"))
          stateHolder.state.refundRequest.isNegativeTesting = true;
          return actions.loadAddressesData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_ERROR
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(addressesAPI.format())).to.be.true
            })
            .catch(() => {
              // Expect that any exception associated with a request is handled
              // without spreading the contagion.
              expect.fail()
            })
        })
      })
    })

    describe('Lookup Reference Data Actions', () => {

      describe('lookupReferencedDataLoaded', () => {
        it('Should export a constant LOOKUP_REFERENCED_DATA_START.', () => {
          expect(LOOKUP_REFERENCED_DATA_START).to.equal('refund/RefundRequest/LOOKUP_REFERENCED_DATA_START')
        })

        it('Should be exported as a function.', () => {
          expect(actions.lookupReferencedDataLoaded).to.be.a('function')
        })

        it('Should return an action with type "LOOKUP_REFERENCED_DATA_LOADED".', () => {
          expect(actions.lookupReferencedDataLoaded())
            .to.have.property('type', LOOKUP_REFERENCED_DATA_LOADED)
        })
      })

      describe('lookupReferencedDataStart', () => {
        it('Should export a constant LOOKUP_REFERENCED_DATA_LOADED.', () => {
          expect(LOOKUP_REFERENCED_DATA_LOADED).to.equal('refund/RefundRequest/LOOKUP_REFERENCED_DATA_LOADED')
        })

        it('Should be exported as a function.', () => {
          expect(actions.lookupReferencedDataStart).to.be.a('function')
        })

        it('Should return an action with type "PDF_LOADED".', () => {
          expect(actions.lookupReferencedDataStart())
            .to.have.property('type', LOOKUP_REFERENCED_DATA_START)
        })
      })

      describe('lookupReferencedData', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = lookupFormData

        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
        let originalRootContext = null;

        beforeEach(() => {
          originalRootContext = setRootContext('', url.parse(baseAPI))
        })

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(initialState)
          stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData);
          dispatchSpy.reset()
          getStateSpy.reset()
          // mocking setup using fully configured request in fluentRequest.
          fetchMock.restore()
          setRootContext('', originalRootContext)
        })

        it('Should be exported as a function.', () => {
          expect(actions.lookupReferencedData).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.lookupReferencedData()).to.be.a('function')
        })

        it('Fetching lookupReferencedData through store returns a Promise', () => {
          return expect(actions.lookupReferencedData()(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Test lookupReferencedData dispatch and all the dispatches it makes', () => {
          return actions.lookupReferencedData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.callCount(11)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOOKUP_REFERENCED_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_LOADED,
                payload: paymentHistoryData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_LOADED,
                payload: namesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_LOADED,
                payload: addressesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOOKUP_REFERENCED_DATA_LOADED
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
              expect(fetchMock.called(namesAPI.format())).to.be.true
              expect(fetchMock.called(addressesAPI.format())).to.be.true
            })
        })

        it('State after lookupReferencedData contains fees, names, addresses and entity types.', () => {
          const expected = cloneDeep(initialState)
          expected.lookupForm = cloneDeep(lookupFormData)
          expected.refundRequestForm.fees = paymentHistoryData
          expected.refundRequestForm.names = namesData
          expected.refundRequestForm.addresses = addressesData
          return actions.lookupReferencedData()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
        })
      })

    })

    describe('Valid Lookup Actions', () => {
      it('Should export a constant VALID_LOOKUP.', () => {
        expect(VALID_LOOKUP).to.equal('refund/RefundRequest/VALID_LOOKUP')
      })

      it('Passing `validLookup()` to reducer should produce lookup form data', () => {
        const testStartState = cloneDeep(initialState)

        testStartState.refundRequestForm.name.found = true
        testStartState.refundRequestForm.address.found = true
        testStartState.refundRequestForm.acknowledgement = true

        const expected = cloneDeep(testStartState)

        expected.lookupForm = lookupFormData
        let state = refundRequestReducer(testStartState, {
          type: VALID_LOOKUP,
          payload: lookupFormData
        })
        expect(state).to.eql(expected)

        expected.isResettingRefundForm = true;
        expected.refundRequestForm.name.found = false
        expected.refundRequestForm.address.found = false
        expected.refundRequestForm.acknowledgement = false
        state = refundRequestReducer(state, {
          type: PRE_RESET_REFUND_REQUEST_FORM
        })

        expect(state).to.eql(expected)

        expected.isResettingRefundForm = false;
        state = refundRequestReducer(state, {
          type: POST_RESET_REFUND_REQUEST_FORM
        })

        expect(state).to.eql(expected)
      })

      describe('validLookup thunk', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = lookupFormData

        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
        let originalRootContext = null;

        beforeEach(() => {
          originalRootContext = setRootContext('', url.parse(baseAPI))
        })

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(initialState)
          dispatchSpy.reset()
          getStateSpy.reset()
          // mocking setup using fully configured request in fluentRequest.
          fetchMock.restore()
          setRootContext('', originalRootContext)
        })

        it('Should be exported as a function.', () => {
          expect(actions.validLookup).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.validLookup(lookupFormData)).to.be.a('function')
        })

        it('Running validLookup through store returns Promise.', () => {
          return expect(actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Test validLookup dispatch and all the dispatches it makes', () => {
          return actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.callCount(17)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: VALID_LOOKUP,
                payload: lookupFormData
              })
              // Neither of these work to test if resetRefundRequestForm() has been called:
              // expect(dispatchSpy).to.have.been.calledWith(actions.resetRefundRequestForm)
              // expect(dispatchSpy).to.have.been.calledWith(() => {})
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: PRE_RESET_REFUND_REQUEST_FORM
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                meta: {form: "resetRefundRequestForm"},
                type: "redux-form/RESET"
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: POST_RESET_REFUND_REQUEST_FORM
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOOKUP_REFERENCED_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_PAYMENT_HISTORY_DATA_LOADED,
                payload: paymentHistoryData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_NAMES_LOADED,
                payload: namesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOAD_ADDRESSES_LOADED,
                payload: addressesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: LOOKUP_REFERENCED_DATA_LOADED
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
              expect(fetchMock.called(namesAPI.format())).to.be.true
              expect(fetchMock.called(addressesAPI.format())).to.be.true
            })
        })

        it('State after validLookup contains lookupFormData, fees, names, addresses and entity types.', () => {
          const expected = cloneDeep(initialState)
          expected.lookupForm = cloneDeep(lookupFormData)
          expected.refundRequestForm.fees = paymentHistoryData
          expected.refundRequestForm.names = namesData
          expected.refundRequestForm.addresses = addressesData
          return actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy)
            .then(() => {
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
        })
      })

    })

    describe('Refund Request Actions', () => {
      describe('postRefundRequest', () => {
        it('Should export a constant POST_REFUND_REQUEST.', () => {
          expect(POST_REFUND_REQUEST).to.equal('refund/RefundRequest/POST_REFUND_REQUEST')
        })

        it('Should be exported as a function.', () => {
          expect(actions.postRefundRequest).to.be.a('function')
        })

        it('Should return an action with type "POST_REFUND_REQUEST".', () => {
          expect(actions.postRefundRequest())
            .to.have.property('type', POST_REFUND_REQUEST)
        })

        it('Passing `postRefundRequest()` to reducer should produce...', () => {
          const expected = cloneDeep(initialState)

          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          expected.isSaving = true;
          let state = refundRequestReducer(initialState, actions.loadingPdf({}))
          state = refundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          state = refundRequestReducer(state, actions.pdfLoaded())
          state = refundRequestReducer(state, actions.postRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe('savedRefundRequest', () => {
        it('Should export a constant SAVED_REFUND_REQUEST.', () => {
          expect(SAVED_REFUND_REQUEST).to.equal('refund/RefundRequest/SAVED_REFUND_REQUEST')
        })

        it('Should be exported as a function.', () => {
          expect(actions.savedRefundRequest).to.be.a('function')
        })

        it('Should return an action with type "SAVED_REFUND_REQUEST".', () => {
          expect(actions.savedRefundRequest())
            .to.have.property('type', SAVED_REFUND_REQUEST)
        })

        it('Should return an action with "payload.isSaving && payload.isSaved" properties.', () => {
          expect(actions.savedRefundRequest())
            .to.have.property('payload').and.eql({isSaving: false, isSaved: true})
        })

        it('Passing `savedRefundRequest()` to reducer should produce...', () => {
          const expected = cloneDeep(initialState)

          expected.isSaved = true;
          let state = refundRequestReducer(initialState, actions.loadingPdf({}))
          state = refundRequestReducer(state, actions.pdfBinary(pdfBinaryData))
          state = refundRequestReducer(state, actions.pdfLoaded())
          state = refundRequestReducer(state, actions.postRefundRequest())
          state = refundRequestReducer(state, actions.savedRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe.skip('saveRefundRequest', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(initialState)
          }
        }
        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
        beforeEach(() => {
          fetchMock.mock('/refunds', 'POST', 'I like turtles!')
        })

        afterEach(() => {
          dispatchSpy.reset()
          getStateSpy.reset()
          // mocking setup using fully configured request in fluentRequest.
          fetchMock.restore()
        })

        it('Should be exported as a function.', () => {
          expect(actions.saveRefundRequest).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(actions.saveRefundRequest('Yow')).to.be.a('function')
        })

        it('Fetching saveRefundRequest through store returns a Promise', () => {
          return expect(actions.saveRefundRequest('Yow')(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('State after fetch contains saveRefundRequest.', () => {
          const expected = cloneDeep(initialState)
          return actions.saveRefundRequest('Yow')(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              // TODO: expect(fetchMock.called('/refunds')).to.be.true
              // TODO: expect(stateHolder.state.refundRequests[0].value).to.equal(expected)
            })
        })
      })
    })

    describe('Clean Up Actions', () => {

      describe('resetState', () => {
        it('Should export a constant RESET_STATE.', () => {
          expect(RESET_STATE).to.equal('refund/RefundRequest/RESET_STATE')
        })

        it('Should be exported as a function.', () => {
          expect(actions.resetState).to.be.a('function')
        })

        it('Should return an action with type "RESET_STATE".', () => {
          expect(actions.resetState())
            .to.have.property('type', RESET_STATE)
        })
      })

      describe('clearErrorReport', () => {
        it('Should export a constant CLEAR_ERROR_REPORT.', () => {
          expect(CLEAR_ERROR_REPORT).to.equal('refund/RefundRequest/CLEAR_ERROR_REPORT')
        })

        it('Should be exported as a function.', () => {
          expect(actions.clearErrorReport).to.be.a('function')
        })

        it('Should return an action with type "CLEAR_ERROR_REPORT".', () => {
          expect(actions.clearErrorReport())
            .to.have.property('type', CLEAR_ERROR_REPORT)
        })

        it('Passing `clearErrorReport()` to reducer should produce addresses', () => {
          const expected = cloneDeep(initialState)

          let state = refundRequestReducer(initialState, actions.loadNamesDataError())
          state = refundRequestReducer(state, actions.loadAddressesDataError())
          state = refundRequestReducer(state,
            actions.loadPaymentHistoryDataError(errorReport))
          state = refundRequestReducer(state, actions.clearErrorReport())
          expect(state).to.eql(expected)
        })
      })
    })

  })
})

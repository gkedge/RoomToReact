/* flow */

import type {ActionPayloadType, RequestIssueReportType} from 'reusable/interfaces/FpngTypes'

import type {
  LookupFormDataType,
  SaveRefundRequestPayloadType,
  RefundRequestStateObjectType
} from 'routes/RefundRequest/interfaces/RefundRequestTypes'

import * as acts from 'routes/RefundRequest/modules/RefundRequestMod'
import refundRequestReducer from 'routes/RefundRequest/modules/RefundRequestMod'

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
    const namesData = [
      {
        "version"   : 0,
        "prefixName": " ",
        "firstName" : "TODD",
        "lastName"  : "BLAKELY",
        "middleName": " ",
        "suffixName": " ",
        "role"      : "Attorney"
      }
    ]
    const addressesData = [
      {
        "version"              : 0,
        "streetLineOne"        : "1560 BROADWAY STEET, SUITE 1200",
        "streetLineTwo"        : " ",
        "cityName"             : "DENVER",
        "geographicRegionModel": {
          "geographicRegionCategory": null,
          "geographicRegionText"    : "CO ",
          "geographicRegionName"    : "COLORADO"
        },
        "countryCode"          : "US",
        "countryName"          : "UNITED STATES",
        "postalCode"           : "80202",
        "type"                 : "Attorney Address"
      }
    ]
    const lookupFormData:LookupFormDataType = {
      isIssue: false,
      isLookingUp: false,
      referenceNum: '0123456',
      dateFrom: '2016-03-24',
      dateTo: '2016-06-15',
      email: 'devnull@gmail.com'
    }
    const issueReport = {
      statusCode: 666,
      statusText: "Can't be gud..."
    }
    const requestIssueReport:RequestIssueReportType = {
      statusCode:       666,
      statusText:       'The devil made me do it.',
      errorCode:        999,
      errorMessageText: ["Entering Dante's Inferno"],
      infoMessageText:  ["Exiting Dante's Inferno"],
      warnMessageText:  ["Is is getting hot or is it me?"]
    }
    const pdfBinaryData:Uint8Array = base64ToBinary('Yow')

    const pdfFile = {}
    const baseAPI = 'http://unit-test'
    const paymentHistoryAPI =
      url.parse(baseAPI + '/paymentHistory/' + lookupFormData.referenceNum)
    const namesAPI = url.parse(baseAPI + '/patents/' + lookupFormData.referenceNum + '/personNames')
    const addressesAPI = url.parse(baseAPI + '/patents/' + lookupFormData.referenceNum + '/addresses')

    describe('Basic reduce tests', () => {
      it('Should be a function.', () => {
        expect(refundRequestReducer).to.be.a('function')
      })

      it('Should initialize with `initialState`.', () => {
        expect(refundRequestReducer(undefined, undefined)).to.equal(acts.initialState)
      })

      it('Passing unexpected action type to reducer should produce current or initial state', () => {
        let state = refundRequestReducer(undefined, {type: 'Yow!'})
        expect(state).to.eql(acts.initialState)
        state = refundRequestReducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(acts.initialState)
      })
    })

    describe('PDF Actions', () => {
      describe('loadingPdf', () => {
        it('Should export a constant LOADING_PDF.', () => {
          expect(acts.LOADING_PDF).to.equal('@@refund/request/LOADING_PDF')
        })

        it('Should be exported as a function.', () => {
          expect(acts.loadingPdf).to.be.a('function')
        })

        it('Should return an action with type "LOADING_PDF".', () => {
          expect(acts.loadingPdf({}))
            .to.have.property('type', acts.LOADING_PDF)
        })

        it('Should assign the first argument to the "payload.pdfFile" property.', () => {
          expect(acts.loadingPdf({}))
            .to.have.property('payload').and.eql({pdfFile: {}})
        })

        it('Passing `loadingPdf()` to reducer should produce `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)

          expected.pdf.isLoading = true;
          expected.pdf.file = {};
          const state = refundRequestReducer(testStartState, acts.loadingPdf({}))

          expect(state).to.eql(expected)
        })
      })

      describe('pdfBinary', () => {
        it('Should export a constant PDF_BINARY.', () => {
          expect(acts.PDF_BINARY).to.equal('@@refund/request/PDF_BINARY')
        })
        it('Should be exported as a function.', () => {
          expect(acts.pdfBinary).to.be.a('function')
        })

        it('Should return an action with type "PDF_BINARY".', () => {
          expect(acts.pdfBinary(base64ToBinary('Yow')))
            .to.have.property('type', acts.PDF_BINARY)
        })

        it('Should assign the first argument to the "payload.pdfRaw" property.', () => {
          expect(acts.pdfBinary(base64ToBinary('Yow')))
            .to.have.property('payload').and.eql({pdfRaw: base64ToBinary('Yow')})
        })

        it('Should default the "payload.base64PDF" property to empty string.', () => {
          expect(acts.pdfBinary(base64ToBinary('')))
            .to.have.property('payload').and.eql({pdfRaw: base64ToBinary('')})
        })

        it('Passing `pdfBinary()` to reducer should produce PDF data', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)

          expected.pdf.isLoading = true;
          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))

          expect(state).to.eql(expected)
        })
      })

      describe('pdfLoaded', () => {
        it('Should export a constant PDF_LOADED.', () => {
          expect(acts.PDF_LOADED).to.equal('@@refund/request/PDF_LOADED')
        })
        it('Should be exported as a function.', () => {
          expect(acts.pdfLoaded).to.be.a('function')
        })

        it('Should return an action with type "PDF_LOADED".', () => {
          expect(acts.pdfLoaded())
            .to.have.property('type', acts.PDF_LOADED)
        })

        it('Passing `pdfLoaded()` to reducer should produce PDF data', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)

          expected.pdf.isLoading = false
          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))
          state = refundRequestReducer(state, acts.pdfLoaded())

          expect(state).to.eql(expected)
        })
      })
    })

    describe('Valid Lookup Actions And Subactions', () => {

      describe('Reset Refund Form Actions', () => {
        it('Should export a constant RESET_REFUND_REQUEST_FORM_START.', () => {
          expect(acts.RESET_REFUND_REQUEST_FORM_START).to.equal('@@refund/request/RESET_REFUND_REQUEST_FORM_START')
        })

        it('Should export a constant RESET_REFUND_REQUEST_FORM_END.', () => {
          expect(acts.RESET_REFUND_REQUEST_FORM_END).to.equal('@@refund/request/RESET_REFUND_REQUEST_FORM_END')
        })

        // TODO: reset refund needs a thunk test like this validateLookup thunk test:
        // describe('validLookup thunk', () => {
        //   const stateHolder = {
        //     state: {
        //       refundRequest: cloneDeep(initialState)
        //     }
        //   }
        //   stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
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
        //     expect(actions.validLookup(cloneDeep(lookupFormData))).to.be.a('function')
        //   })
        //
        //   it('Running validLookup through store returns Promise.', () => {
        //     return expect(actions.validLookup(cloneDeep(lookupFormData))(dispatchSpy,
        // getStateSpy)) .to.eventually.be.fulfilled })  it('Test validLookup dispatch and all the
        // dispatches it makes', () => { return
        // actions.validLookup(cloneDeep(lookupFormData))(dispatchSpy, getStateSpy) .then(() => {
        // expect(dispatchSpy).to.have.callCount(17)
        // expect(dispatchSpy).to.have.been.calledWithExactly({ type:    VALID_LOOKUP_START,
        // payload: lookupFormData }) // Neither of these work to test if resetRefundRequestForm()
        // has been called: //
        // expect(dispatchSpy).to.have.been.calledWith(actions.resetRefundRequestForm) //
        // expect(dispatchSpy).to.have.been.calledWith(() => {})
        // expect(dispatchSpy).to.have.been.calledWithExactly({ type:
        // RESET_REFUND_REQUEST_FORM_START }) expect(dispatchSpy).to.have.been.calledWithExactly({
        // meta: {form: "resetRefundRequestForm"}, type: "redux-form/RESET" })
        // expect(dispatchSpy).to.have.been.calledWithExactly({ type: RESET_REFUND_REQUEST_FORM_END
        // }) expect(dispatchSpy).to.have.been.calledWithExactly({ type:
        // LOOKUP_REFERENCED_DATA_START }) expect(dispatchSpy).to.have.been.calledWithExactly({
        // type: LOAD_PAYMENT_HISTORY_DATA_START })
        // expect(dispatchSpy).to.have.been.calledWithExactly({ type:
        // LOAD_PAYMENT_HISTORY_DATA_LOADED, payload: paymentHistoryData })
        // expect(dispatchSpy).to.have.been.calledWithExactly({ type: LOAD_NAMES_START })
        // expect(dispatchSpy).to.have.been.calledWithExactly({ type:    LOAD_NAMES_LOADED, payload: namesData }) expect(dispatchSpy).to.have.been.calledWithExactly({ type: LOAD_ADDRESSES_START }) expect(dispatchSpy).to.have.been.calledWithExactly({ type:    LOAD_ADDRESSES_LOADED, payload: addressesData }) expect(dispatchSpy).to.have.been.calledWithExactly({ type: LOOKUP_REFERENCED_DATA_LOADED }) // mocking setup using fully configured request in fluentRequest. expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true expect(fetchMock.called(namesAPI.format())).to.be.true expect(fetchMock.called(addressesAPI.format())).to.be.true }) })  it('State after validLookup contains lookupFormData, fees, names, addresses and entity types.', () => { const expected = cloneDeep(initialState) expected.lookupForm = lookupFormData expected.refundRequestForm.fees = paymentHistoryData expected.refundRequestForm.names = namesData expected.refundRequestForm.addresses = addressesData return actions.validLookup(lookupFormData)(dispatchSpy, getStateSpy) .then(() => { expect(stateHolder.state.refundRequest).to.eql(expected) }) }) })

      })

      describe('Lookup Reference Data Actions and Subactions', () => {

        describe('Reset Refund Request Form Actions', () => {
          describe('resetRefundRequestFormStart', () => {
            it('Should export a constant RESET_REFUND_REQUEST_FORM_START.', () => {
              expect(acts.RESET_REFUND_REQUEST_FORM_START).to.equal('@@refund/request/RESET_REFUND_REQUEST_FORM_START')
            })

            it('Should be exported as a function.', () => {
              expect(acts.resetRefundRequestFormStart).to.be.a('function')
            })

            it('Should return an action with type "RESET_REFUND_REQUEST_FORM_START".', () => {
              expect(acts.resetRefundRequestFormStart())
                .to.have.property('type', acts.RESET_REFUND_REQUEST_FORM_START)
            })

            it('Mutate state through reducer expected to set refund form `reseting` truth', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.isResettingRefundForm = true;

              const state = refundRequestReducer(testStartState,
                acts.resetRefundRequestFormStart())

              expect(state).to.eql(expected)
            })
          })

          describe('resetRefundRequestFormEnd', () => {
            it('Should export a constant RESET_REFUND_REQUEST_FORM_END.', () => {
              expect(acts.RESET_REFUND_REQUEST_FORM_END).to.equal('@@refund/request/RESET_REFUND_REQUEST_FORM_END')
            })

            it('Should be exported as a function.', () => {
              expect(acts.resetRefundRequestFormEnd).to.be.a('function')
            })

            it('Should return an action with type "RESET_REFUND_REQUEST_FORM_END".', () => {
              expect(acts.resetRefundRequestFormEnd())
                .to.have.property('type', acts.RESET_REFUND_REQUEST_FORM_END)
            })

            it('Mutate state through reducer expected to indicate refund form finished`reseting`', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              let state = refundRequestReducer(testStartState, acts.resetRefundRequestFormStart())
              state = refundRequestReducer(state, acts.resetRefundRequestFormEnd())

              expect(state).to.eql(expected)
            })

          })

          describe('resetRefundRequestForm (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Should be exported as a function.', () => {
              expect(acts.resetRefundRequestForm).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.resetRefundRequestForm()).to.be.a('function')
            })

            it('resetRefundRequestForm thunk expected to return void', () => {
              return expect(acts.resetRefundRequestForm()(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Test resetRefundRequestForm dispatch and all the dispatches it makes', () => {
              acts.resetRefundRequestForm()(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledThrice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.RESET_REFUND_REQUEST_FORM_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                meta: { form: "resetRefundRequestForm" },
                type: "redux-form/RESET"
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.RESET_REFUND_REQUEST_FORM_END
              })
            })

            it('State after resetRefundRequestForm contains fees.', () => {
              const expected = cloneDeep(acts.initialState)
              acts.resetRefundRequestForm()(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })

          })
        })

        describe('Payment History Actions', () => {

          describe('loadPaymentHistoryDataStart', () => {
            it('Should export a constant LOAD_PAYMENT_HISTORY_DATA_START.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_START).to.equal('@@refund/request/LOAD_PAYMENT_HISTORY_DATA_START')
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadPaymentHistoryDataStart).to.be.a('function')
            })

            it('Should return an action with type "LOAD_PAYMENT_HISTORY_DATA_STARTED".', () => {
              expect(acts.loadPaymentHistoryDataStart())
                .to.have.property('type', acts.LOAD_PAYMENT_HISTORY_DATA_START)
            })

            it('Mutate state through reducer expected to produce history `loading` truth', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingPaymentHistory = true;

              const state = refundRequestReducer(testStartState, acts.loadPaymentHistoryDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('loadPaymentHistoryDataLoaded', () => {
            it('Should export a constant LOAD_PAYMENT_HISTORY_DATA_LOADED.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_LOADED).to.equal('@@refund/request/LOAD_PAYMENT_HISTORY_DATA_LOADED')
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadPaymentHistoryDataLoaded).to.be.a('function')
            })

            it('Should return an action with type "LOAD_PAYMENT_HISTORY_DATA_LOADED".', () => {
              expect(acts.loadPaymentHistoryDataLoaded(paymentHistoryData))
                .to.have.property('type', acts.LOAD_PAYMENT_HISTORY_DATA_LOADED)
            })

            it('Should assign the first argument to `payload` property.', () => {
              expect(acts.loadPaymentHistoryDataLoaded(paymentHistoryData))
                .to.have.property('payload').and.eql(paymentHistoryData)
            })

            it('Mutate state through reducer expected to produce payment history', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.refundRequestForm.fees = paymentHistoryData
              let state = refundRequestReducer(testStartState, acts.loadPaymentHistoryDataStart())
              state = refundRequestReducer(state, acts.loadPaymentHistoryDataLoaded(paymentHistoryData))

              expect(state).to.eql(expected)
            })

          })

          describe('loadPaymentHistoryDataIssue (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Should export a constant LOAD_PAYMENT_HISTORY_DATA_ISSUE.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE).to.equal('@@refund/request/LOAD_PAYMENT_HISTORY_DATA_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadPaymentHistoryDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadPaymentHistoryDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('loadPaymentHistoryDataIssue thunk expected to return void', () => {
              return expect(acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Test loadPaymentHistoryDataIssue dispatch and all the dispatches it makes', () => {
              acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE,
                payload: requestIssueReport
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
            })

            it('State after loadPaymentHistoryDataIssue expected to contain issue report.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.refundRequestForm.isIssue = true
              expected.refundRequestForm.issueReport = [ requestIssueReport ]
              acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })

          })

          describe('loadPaymentHistoryData (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData);
              stateHolder.state.refundRequest.refundRequestForm.fees = null;
              dispatchSpy.reset()
              getStateSpy.reset()
              fetchMock.restore() // mocking setup using fully configured request in fluentRequest.
              setRootContext('', originalRootContext)
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadPaymentHistoryData).to.be.a('function')
            })

            it('Should return a function (is a thunk).', () => {
              expect(acts.loadPaymentHistoryData()).to.be.a('function')
            })

            it('Fetching loadPaymentHistoryData through store returns a Promise', () => {
              return expect(acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Test loadPaymentHistoryData dispatch and all the dispatches it makes', () => {
              return acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_START
                  })
                  expect(dispatchSpy).to.have.been.calledWith({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_LOADED,
                    payload: paymentHistoryData
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
                })
            })

            it('Mutate state through reducer expected to contains fees.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.lookupForm = lookupFormData
              expected.refundRequestForm.fees = paymentHistoryData
              return acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })

            it('Test loadPaymentHistoryData dispatch with bad data (#1) and all the dispatches it makes', () => {
              fetchMock.restore()
              const response = {
                body: "'yow!',",
                headers: {
                  'Content-Type': 'application/json; charset=utf-8'
                }
              }
              fetchMock.mock(paymentHistoryAPI.format(), 'GET', response)
              stateHolder.state.refundRequest.isNegativeTesting = true;
              return acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.callCount(4)
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE,
                    payload: {
                      statusCode: 700,
                      statusText: 'Bad data response'
                    }
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.ISSUE_RAISED,
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
                body: JSON.stringify("yow!"),
                headers: {
                  'Content-Type': 'application/json; charset=utf-8'
                }
              }
              fetchMock.mock(paymentHistoryAPI.format(), 'GET', response)
              stateHolder.state.refundRequest.isNegativeTesting = true;
              return acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.callCount(4)
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE,
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
              expect(acts.LOAD_NAMES_START).to.equal('@@refund/request/LOAD_NAMES_START')
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadNamesDataStart).to.be.a('function')
            })

            it('Should return an action with type "LOAD_NAMES_START".', () => {
              expect(acts.loadNamesDataStart())
                .to.have.property('type', acts.LOAD_NAMES_START)
            })

            it('Passing `loadNamesDataStart()` to reducer should produce `loading` truth', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingNames = true;

              const state = refundRequestReducer(testStartState, acts.loadNamesDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('loadNamesDataLoaded', () => {
            const namesData = [{"firstName": "Tommy", "lastName": "Turtle"}]

            it('Should export a constant LOAD_NAMES_ISSUE.', () => {
              expect(acts.LOAD_NAMES_ISSUE).to.equal('@@refund/request/LOAD_NAMES_ISSUE')
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadNamesDataLoaded).to.be.a('function')
            })

            it('Should return an action with type "LOAD_NAMES_LOADED".', () => {
              expect(acts.loadNamesDataLoaded(namesData))
                .to.have.property('type', acts.LOAD_NAMES_LOADED)
            })

            it('Should assign the first argument to `payload` property.', () => {
              expect(acts.loadNamesDataLoaded(namesData))
                .to.have.property('payload').and.eql(namesData)
            })

            it('Passing `loadNamesDataLoaded()` to reducer should produce names', () => {
              const namesData = [{"firstName": "Tommy", "lastName": "Turtle"}]
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.refundRequestForm.names = namesData

              let state = refundRequestReducer(testStartState, acts.loadNamesDataStart())
              state = refundRequestReducer(state, acts.loadNamesDataLoaded(namesData))

              expect(state).to.eql(expected)
            })

          })

          describe('loadNamesDataIssue (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Should export a constant LOAD_NAMES_ISSUE.', () => {
              expect(acts.LOAD_NAMES_ISSUE).to.equal('@@refund/request/LOAD_NAMES_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadNamesDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadNamesDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('loadNamesDataIssue thunk expected to return void', () => {
              return expect(acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Test loadNamesDataIssue dispatch and all the dispatches it makes', () => {
              acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_NAMES_ISSUE,
                payload: requestIssueReport
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
            })

            it('State after loadNamesDataIssue issue report.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.lookupForm.isIssue = true
              expected.lookupForm.issueReport = [ requestIssueReport ]
              expected.refundRequestForm.names.isIssue = true
              acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })

          })

          describe('loadNamesData (thunk)', () => {

            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
              stateHolder.state.refundRequest.refundRequestForm.names = null
              dispatchSpy.reset()
              getStateSpy.reset()
              fetchMock.restore()  // mocking setup using fully configured request in fluentRequest.
              setRootContext('', originalRootContext)
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadNamesData).to.be.a('function')
            })

            it('Should return a function (is a thunk).', () => {
              expect(acts.loadNamesData()).to.be.a('function')
            })

            it('Fetching loadNamesData through store returns a Promise', () => {
              return expect(acts.loadNamesData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Test loadNamesData dispatch and all the dispatches it makes', () => {
              return acts.loadNamesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_LOADED,
                    payload: namesData
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(namesAPI.format())).to.be.true
                })
            })

            it('State after loadNamesData contains list of names.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.lookupForm = lookupFormData
              expected.refundRequestForm.names = namesData
              return acts.loadNamesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })

            it('Test loadNamesData dispatch with bad data (#1) and all the dispatches it makes', () => {
              fetchMock.restore()
              fetchMock.mock(namesAPI.format(), 'GET', "['yow!',]")
              stateHolder.state.refundRequest.isNegativeTesting = true;
              return acts.loadNamesData()(dispatchSpy, getStateSpy)
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
                    type: acts.LOAD_NAMES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_ISSUE
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(namesAPI.format())).to.be.true
                })
            })

            it('Test loadNamesData dispatch with bad data (#2) and all the dispatches it makes', () => {
              fetchMock.restore()
              fetchMock.mock(namesAPI.format(), 'GET', JSON.stringify("yow!"))
              stateHolder.state.refundRequest.isNegativeTesting = true;
              return acts.loadNamesData()(dispatchSpy, getStateSpy)
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
                    type: acts.LOAD_NAMES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_ISSUE
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
              expect(acts.LOAD_ADDRESSES_START).to.equal('@@refund/request/LOAD_ADDRESSES_START')
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadAddressesDataStart).to.be.a('function')
            })

            it('Should return an action with type "LOAD_ADDRESSES_START".', () => {
              expect(acts.loadAddressesDataStart())
                .to.have.property('type', acts.LOAD_ADDRESSES_START)
            })

            it('Passing `loadAddressesDataStart()` to reducer should produce `loading` truth', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingAddresses = true;

              const state = refundRequestReducer(testStartState, acts.loadAddressesDataStart())

              expect(state).to.eql(expected)
            })

          })

          describe('loadAddressesDataLoaded', () => {
            it('Should export a constant LOAD_ADDRESSES_LOADED.', () => {
              expect(acts.LOAD_ADDRESSES_LOADED).to.equal('@@refund/request/LOAD_ADDRESSES_LOADED')
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadAddressesDataLoaded).to.be.a('function')
            })

            it('Should return an action with type "LOAD_ADDRESSES_LOADED".', () => {
              expect(acts.loadAddressesDataLoaded(addressesData))
                .to.have.property('type', acts.LOAD_ADDRESSES_LOADED)
            })

            it('Should assign the first argument to `payload` property.', () => {
              expect(acts.loadAddressesDataLoaded(addressesData))
                .to.have.property('payload').and.eql(addressesData)
            })

            it('Passing `loadAddressesDataIssue()` to reducer should produce `issue` truth', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.refundRequestForm.address.isIssue = true;

              const state = refundRequestReducer(testStartState, acts.loadAddressesDataIssue())

              expect(state).to.eql(expected)
            })

          })

          describe('loadAddressesDataIssue (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Should export a constant LOAD_ADDRESSES_ISSUE.', () => {
              expect(acts.LOAD_ADDRESSES_ISSUE).to.equal('@@refund/request/LOAD_ADDRESSES_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadAddressesDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadAddressesDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('loadAddressesDataIssue thunk expected to return void', () => {
              return expect(acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Test loadAddressesDataIssue dispatch and all the dispatches it makes', () => {
              acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_ADDRESSES_ISSUE,
                payload: requestIssueReport
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
            })

            it('State after loadAddressesDataIssue expected to contain issue report.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.lookupForm.isIssue = true
              expected.lookupForm.issueReport = [ requestIssueReport ]
              expected.refundRequestForm.addresses.isIssue = true
              acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
          })

          describe('loadAddressesData (thunk(', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)
              stateHolder.state.refundRequest.refundRequestForm.addresses = null;
              dispatchSpy.reset()
              getStateSpy.reset()
              // mocking setup using fully configured request in fluentRequest.
              fetchMock.restore()
              setRootContext('', originalRootContext)
            })

            it('Should be exported as a function.', () => {
              expect(acts.loadAddressesData).to.be.a('function')
            })

            it('Should return a function (is a thunk).', () => {
              expect(acts.loadAddressesData()).to.be.a('function')
            })

            it('Fetching loadAddressesData through store returns a Promise', () => {
              return expect(acts.loadAddressesData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Test loadAddressesData dispatch and all the dispatches it makes', () => {
              return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_LOADED,
                    payload: addressesData
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(addressesAPI.format())).to.be.true
                })
            })

            it('State after loadAddressesData contains list of addresses.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.lookupForm = lookupFormData
              expected.refundRequestForm.addresses = addressesData
              return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })

            it('Test loadAddressesData dispatch with bad data (#1) and all the dispatches it makes', () => {
              fetchMock.restore()
              fetchMock.mock(addressesAPI.format(), 'GET', "['yow!',]")
              stateHolder.state.refundRequest.isNegativeTesting = true;
              return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_ISSUE
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
              return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_ISSUE
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
          describe('lookupReferencedDataStart', () => {
            it('Should export a constant LOOKUP_REFERENCED_DATA_LOADED.', () => {
              expect(acts.LOOKUP_REFERENCED_DATA_LOADED).to.equal('@@refund/request/LOOKUP_REFERENCED_DATA_LOADED')
            })

            it('Should be exported as a function.', () => {
              expect(acts.lookupReferencedDataStart).to.be.a('function')
            })

            it('Should return an action with type "LOOKUP_REFERENCED_DATA_START".', () => {
              expect(acts.lookupReferencedDataStart())
                .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_START)
            })

            it('Passing `lookupReferencedDataStart()` to reducer should retain lookupForm `loading` truth from `validLookup()', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.lookupForm = cloneDeep(lookupFormData)
              expected.lookupForm.isLookingUp = true

              let state = refundRequestReducer(testStartState, acts.validLookupStart(cloneDeep(lookupFormData)))
              state = refundRequestReducer(state, acts.lookupReferencedDataStart())

              expect(state).to.eql(expected)
            })

          })

          describe('lookupReferencedDataLoaded', () => {
            it('Should export a constant LOOKUP_REFERENCED_DATA_START.', () => {
              expect(acts.LOOKUP_REFERENCED_DATA_START).to.equal('@@refund/request/LOOKUP_REFERENCED_DATA_START')
            })

            it('Should be exported as a function.', () => {
              expect(acts.lookupReferencedDataLoaded).to.be.a('function')
            })

            it('Should return an action with type "LOOKUP_REFERENCED_DATA_LOADED".', () => {
              expect(acts.lookupReferencedDataLoaded())
                .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_LOADED)
            })

            it('Passing `lookupReferencedDataLoaded()` to reducer should produce `loading` truth', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected = cloneDeep(testStartState)
              expected.lookupForm = cloneDeep(lookupFormData)
              expected.lookupForm.isLookingUp = true;

              let state = refundRequestReducer(testStartState, acts.validLookupStart(cloneDeep(lookupFormData)))
              state = refundRequestReducer(state, acts.lookupReferencedDataLoaded())

              expect(state).to.eql(expected)
            })
          })

          describe('lookupReferencedData (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)

            const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData);
              dispatchSpy.reset()
              getStateSpy.reset()
              // mocking setup using fully configured request in fluentRequest.
              fetchMock.restore()
              setRootContext('', originalRootContext)
            })

            it('Should be exported as a function.', () => {
              expect(acts.lookupReferencedData).to.be.a('function')
            })

            it('Should return a function (is a thunk).', () => {
              expect(acts.lookupReferencedData()).to.be.a('function')
            })

            it('Fetching lookupReferencedData through store returns a Promise', () => {
              return expect(acts.lookupReferencedData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Test lookupReferencedData dispatch and all the dispatches it makes', () => {
              return acts.lookupReferencedData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.callCount(11)
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOOKUP_REFERENCED_DATA_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_LOADED,
                    payload: namesData
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_LOADED,
                    payload: addressesData
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_LOADED,
                    payload: paymentHistoryData
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOOKUP_REFERENCED_DATA_LOADED
                  })

                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
                  expect(fetchMock.called(namesAPI.format())).to.be.true
                  expect(fetchMock.called(addressesAPI.format())).to.be.true
                })
            })

            it('State after lookupReferencedData contains fees, names, addresses and entity types.', () => {
              const expected = cloneDeep(acts.initialState)
              expected.lookupForm = lookupFormData
              expected.refundRequestForm.fees = paymentHistoryData
              expected.refundRequestForm.names = namesData
              expected.refundRequestForm.addresses = addressesData
              return acts.lookupReferencedData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })
          })
        })

      })

      describe('validLookupStart', () => {
        it('Should export a constant VALID_LOOKUP_START.', () => {
          expect(acts.VALID_LOOKUP_START).to.equal('@@refund/request/VALID_LOOKUP_START')
        })

        it('Should be exported as a function.', () => {
          expect(acts.validLookupStart).to.be.a('function')
        })

        it('Should return an action with type "VALID_LOOKUP_START".', () => {
          expect(acts.validLookupStart(cloneDeep(lookupFormData)))
            .to.have.property('type', acts.VALID_LOOKUP_START)
        })

        it('Mutate state through reducer expected to produce lookup `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)
          expected.lookupForm = cloneDeep(lookupFormData)
          expected.lookupForm.isLookingUp = true
          const state = refundRequestReducer(testStartState,
            acts.validLookupStart(cloneDeep(lookupFormData)))

          expect(state).to.eql(expected)
        })
      })

      describe('validLookupEnd', () => {
        it('Should export a constant VALID_LOOKUP_END.', () => {
          expect(acts.VALID_LOOKUP_END).to.equal('@@refund/request/VALID_LOOKUP_END')
        })

        it('Should be exported as a function.', () => {
          expect(acts.validLookupEnd).to.be.a('function')
        })

        it('Should return an action with type "VALID_LOOKUP_END".', () => {
          expect(acts.validLookupEnd(cloneDeep(lookupFormData)))
            .to.have.property('type', acts.VALID_LOOKUP_END)
        })

        it('Mutate state through reducer expected to produce lookup `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)
          expected.lookupForm = lookupFormData
          let state = refundRequestReducer(testStartState,
            acts.validLookupStart(cloneDeep(lookupFormData)))
          state = refundRequestReducer(state, acts.validLookupEnd())

          expect(state).to.eql(expected)
        })
      })

      it('Should be exported as a function.', () => {
        expect(acts.validLookup).to.be.a('function')
      })

      describe('validLookup (thunk)', () => {
        const stateHolder                          = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupFormData)

        const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)
        let originalRootContext = null;

        beforeEach(() => {
          originalRootContext = setRootContext('', url.parse(baseAPI))
        })

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(acts.initialState)
          dispatchSpy.reset()
          getStateSpy.reset()
          // mocking setup using fully configured request in fluentRequest.
          fetchMock.restore()
          setRootContext('', originalRootContext)
        })

        it('Should return a function (is a thunk).', () => {
          expect(acts.validLookup(cloneDeep(lookupFormData))).to.be.a('function')
        })

        it('`validLookup()` expected to returns Promise.', () => {
          return expect(acts.validLookup(cloneDeep(lookupFormData))(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Test validLookup dispatch and all the dispatches it makes', () => {
          return acts.validLookup(cloneDeep(lookupFormData))(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.callCount(18)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type   : acts.VALID_LOOKUP_START,
                payload: lookupFormData
              })
              // Neither of these work to test if resetRefundRequestForm() has been called:
              // expect(dispatchSpy).to.have.been.calledWith(actions.resetRefundRequestForm)
              // expect(dispatchSpy).to.have.been.calledWith(() => {})
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.RESET_REFUND_REQUEST_FORM_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                meta: { form: "resetRefundRequestForm" },
                type: "redux-form/RESET"
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.RESET_REFUND_REQUEST_FORM_END
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOOKUP_REFERENCED_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_PAYMENT_HISTORY_DATA_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_NAMES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_ADDRESSES_START
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_NAMES_LOADED,
                payload: namesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_ADDRESSES_LOADED,
                payload: addressesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_PAYMENT_HISTORY_DATA_LOADED,
                payload: paymentHistoryData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOOKUP_REFERENCED_DATA_LOADED
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.VALID_LOOKUP_END
              })

              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
              expect(fetchMock.called(namesAPI.format())).to.be.true
              expect(fetchMock.called(addressesAPI.format())).to.be.true
            })
        })

        it(
          'State after validLookup contains lookupFormData, fees, names, addresses and entity types.',
          () => {
            const expected                       = cloneDeep(acts.initialState)
            expected.lookupForm                  = lookupFormData
            expected.refundRequestForm.fees      = paymentHistoryData
            expected.refundRequestForm.names     = namesData
            expected.refundRequestForm.addresses = addressesData
            return acts.validLookup(cloneDeep(lookupFormData))(dispatchSpy, getStateSpy)
              .then(() => {
                expect(stateHolder.state.refundRequest).to.eql(expected)
              })
          })
      })

    })

    describe('Refund Request Actions', () => {
      describe('postRefundRequest', () => {
        it('Should export a constant POST_REFUND_REQUEST.', () => {
          expect(acts.POST_REFUND_REQUEST).to.equal('@@refund/request/POST_REFUND_REQUEST')
        })

        it('Should be exported as a function.', () => {
          expect(acts.postRefundRequest).to.be.a('function')
        })

        it('Should return an action with type "POST_REFUND_REQUEST".', () => {
          expect(acts.postRefundRequest())
            .to.have.property('type', acts.POST_REFUND_REQUEST)
        })

        it('Passing `postRefundRequest()` to reducer should produce...', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)

          expected.pdf.file = {}
          expected.pdf.binaryContent = pdfBinaryData
          expected.isSaving = true;
          let state = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))
          state = refundRequestReducer(state, acts.pdfLoaded())
          state = refundRequestReducer(state, acts.postRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe('savedRefundRequest', () => {
        it('Should export a constant SAVED_REFUND_REQUEST.', () => {
          expect(acts.SAVED_REFUND_REQUEST).to.equal('@@refund/request/SAVED_REFUND_REQUEST')
        })

        it('Should be exported as a function.', () => {
          expect(acts.savedRefundRequest).to.be.a('function')
        })

        it('Should return an action with type "SAVED_REFUND_REQUEST".', () => {
          expect(acts.savedRefundRequest())
            .to.have.property('type', acts.SAVED_REFUND_REQUEST)
        })

        it('Should return an action with "payload.isSaving && payload.isSaved" properties.', () => {
          expect(acts.savedRefundRequest())
            .to.have.property('payload').and.eql({isSaving: false, isSaved: true})
        })

        it('Passing `savedRefundRequest()` to reducer should produce...', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected = cloneDeep(testStartState)

          expected.isSaved = true;
          let state = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))
          state = refundRequestReducer(state, acts.pdfLoaded())
          state = refundRequestReducer(state, acts.postRefundRequest())
          state = refundRequestReducer(state, acts.savedRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe.skip('saveRefundRequest', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
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
          expect(acts.saveRefundRequest).to.be.a('function')
        })

        it('Should return a function (is a thunk).', () => {
          expect(acts.saveRefundRequest('Yow')).to.be.a('function')
        })

        it('Fetching saveRefundRequest through store returns a Promise', () => {
          return expect(acts.saveRefundRequest('Yow')(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('State after fetch contains saveRefundRequest.', () => {
          const expected = cloneDeep(acts.initialState)
          return acts.saveRefundRequest('Yow')(dispatchSpy, getStateSpy)
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
          expect(acts.RESET_STATE).to.equal('@@refund/request/RESET_STATE')
        })

        it('Should be exported as a function.', () => {
          expect(acts.resetState).to.be.a('function')
        })

        it('Should return an action with type "RESET_STATE".', () => {
          expect(acts.resetState())
            .to.have.property('type', acts.RESET_STATE)
        })
      })

      describe('clearIssueReport', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
          }
        }
        const {dispatchSpy, getStateSpy} = reducerSpy(refundRequestReducer, stateHolder)

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(acts.initialState)
          dispatchSpy.reset()
          getStateSpy.reset()
        })

        it('Should export a constant CLEAR_ISSUE_REPORT.', () => {
          expect(acts.CLEAR_ISSUE_REPORT).to.equal('@@refund/request/CLEAR_ISSUE_REPORT')
        })

        it('Should be exported as a function.', () => {
          expect(acts.clearIssueReport).to.be.a('function')
        })

        it('Should return an action with type "CLEAR_ISSUE_REPORT".', () => {
          expect(acts.clearIssueReport())
            .to.have.property('type', acts.CLEAR_ISSUE_REPORT)
        })

        it('Mutate state through reducer expected to clear all issues in state', () => {
          acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          const state = refundRequestReducer(stateHolder.state.refundRequest, acts.clearIssueReport())

          expect(state).to.eql(acts.initialState)
        })
      })
    })

  })
})

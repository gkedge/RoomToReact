/* flow */

import type {ActionPayloadType, RequestIssueReportType} from 'reusable/interfaces/FpngTypes'

import type {
  LookupDataType,
  NamesDataType,
  AddressesDataType,
  PaymentHistoryDataType,
  SaveRefundRequestPayloadType
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

    const paymentHistoryData:PaymentHistoryDataType = [
      {
        "version": 0,
        "items":   [
          {
            "postingReferenceText": "0123456",
            "datePosted":           "2016-03-17",
            "feeCode":              "8001",
            "feeCodeDescription":   "PRINTED COPY OF PATENT W/O COLOR, REGULAR SERVICE",
            "feeAmount":            3,
            "quantity":             1,
            "amount":               3,
            "mailRoomDate":         "2016-03-17",
            "paymentMethodType":    "DA500999"
          }
        ]
      }
    ]
    const namesData:NamesDataType                   = [
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
    const addressesData:AddressesDataType           = [
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
    const lookupData:LookupDataType                 = {
      isIssue:      false,
      issueReport:  [],
      isLookingUp:  false,
      referenceNum: '0123456',
      dateFrom:     '2016-03-24',
      dateTo:       '2016-06-15',
      email:        'devnull@gmail.com'
    }
    const issueReport                               = {
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
    const pdfBinaryData:Uint8Array                  = base64ToBinary('Yow')

    const pdfFile           = {}
    const baseAPI           = 'http://unit-test'
    const paymentHistoryAPI =
            url.parse(baseAPI + '/paymentHistory/' + lookupData.referenceNum)
    const namesAPI          = url.parse(
      baseAPI + '/patents/' + lookupData.referenceNum + '/personNames')
    const addressesAPI      = url.parse(
      baseAPI + '/patents/' + lookupData.referenceNum + '/addresses')

    describe('Basic reduce tests', () => {
      it('Expected to be a function.', () => {
        expect(refundRequestReducer).to.be.a('function')
      })

      it('Expected to initialize with `initialState`.', () => {
        expect(refundRequestReducer(undefined, undefined)).to.equal(acts.initialState)
      })

      it('Mutate state through reducer expected to produce current or initial state', () => {
        let state = refundRequestReducer(undefined, { type: 'Yow!' })
        expect(state).to.eql(acts.initialState)
        state = refundRequestReducer(state, { type: '@@@@@@@' })
        expect(state).to.eql(acts.initialState)
      })

      describe('Raise issue Action', () => {

        it('Expected to export a constant ISSUE_RAISED.', () => {
          expect(acts.ISSUE_RAISED).to.equal('@@refund/request/ISSUE_RAISED')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.raiseIssue).to.be.a('function')
        })

        it('Expected to return an action with type "ISSUE_RAISED".', () => {
          expect(acts.raiseIssue("I have issues... :-/"))
            .to.have.property('type', acts.ISSUE_RAISED)
        })

        it('Mutate state through reducer with a request report expected to produce `issue` report',
          () => {
            const testStartState = cloneDeep(acts.initialState)
            const expected       = cloneDeep(testStartState)
            expected.isIssue     = true
            expected.issueReport = [requestIssueReport]

            const state = refundRequestReducer(testStartState, acts.raiseIssue(requestIssueReport))

            expect(state).to.eql(expected)
          })

        it('Mutate state through reducer with a string issue expected to produce `issue` report',
          () => {
            const issueString    = "I have issues... :-/"
            const testStartState = cloneDeep(acts.initialState)
            const expected       = cloneDeep(testStartState)
            expected.isIssue     = true
            expected.issueReport = [{
              statusCode: 710,
              statusText: issueString
            }]

            const state = refundRequestReducer(testStartState, acts.raiseIssue(issueString))

            expect(state).to.eql(expected)
          })
      })
    })

    describe('PDF Actions', () => {
      describe('loadingPdf', () => {
        it('Expected to export a constant LOADING_PDF.', () => {
          expect(acts.LOADING_PDF).to.equal('@@refund/request/LOADING_PDF')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.loadingPdf).to.be.a('function')
        })

        it('Expected to return an action with type "LOADING_PDF".', () => {
          expect(acts.loadingPdf({}))
            .to.have.property('type', acts.LOADING_PDF)
        })

        it('Expected to assign the first argument to the "payload.pdfFile" property.', () => {
          expect(acts.loadingPdf({}))
            .to.have.property('payload').and.eql({ pdfFile: {} })
        })

        it('Mutate state through reducer expected to produce `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)

          expected.pdf.isLoading = true;
          expected.pdf.file      = {};
          const state            = refundRequestReducer(testStartState, acts.loadingPdf({}))

          expect(state).to.eql(expected)
        })
      })

      describe('pdfBinary', () => {
        it('Expected to export a constant PDF_BINARY.', () => {
          expect(acts.PDF_BINARY).to.equal('@@refund/request/PDF_BINARY')
        })
        it('Expected to be exported as a function.', () => {
          expect(acts.pdfBinary).to.be.a('function')
        })

        it('Expected to return an action with type "PDF_BINARY".', () => {
          expect(acts.pdfBinary(base64ToBinary('Yow')))
            .to.have.property('type', acts.PDF_BINARY)
        })

        it('Expected to assign the first argument to the "payload.pdfRaw" property.', () => {
          expect(acts.pdfBinary(base64ToBinary('Yow')))
            .to.have.property('payload').and.eql({ pdfRaw: base64ToBinary('Yow') })
        })

        it('Expected to default the "payload.base64PDF" property to empty string.', () => {
          expect(acts.pdfBinary(base64ToBinary('')))
            .to.have.property('payload').and.eql({ pdfRaw: base64ToBinary('') })
        })

        it('Mutate state through reducer expected to produce PDF data', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)

          expected.pdf.isLoading     = true;
          expected.pdf.file          = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state                  = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state                      = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))

          expect(state).to.eql(expected)
        })
      })

      describe('pdfLoaded', () => {
        it('Expected to export a constant PDF_LOADED.', () => {
          expect(acts.PDF_LOADED).to.equal('@@refund/request/PDF_LOADED')
        })
        it('Expected to be exported as a function.', () => {
          expect(acts.pdfLoaded).to.be.a('function')
        })

        it('Expected to return an action with type "PDF_LOADED".', () => {
          expect(acts.pdfLoaded())
            .to.have.property('type', acts.PDF_LOADED)
        })

        it('Mutate state through reducer expected to produce PDF data', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)

          expected.pdf.isLoading     = false
          expected.pdf.file          = {}
          expected.pdf.binaryContent = pdfBinaryData
          let state                  = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state                      = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))
          state                      = refundRequestReducer(state, acts.pdfLoaded())

          expect(state).to.eql(expected)
        })
      })
    })

    describe('Valid Lookup Actions And Subactions', () => {

      describe('Reset Refund Form Actions', () => {
        it('Expected to export a constant RESET_REFUND_REQUEST_FORM_START.', () => {
          expect(acts.RESET_REFUND_REQUEST_FORM_START).to.equal(
            '@@refund/request/RESET_REFUND_REQUEST_FORM_START')
        })

        it('Expected to export a constant RESET_REFUND_REQUEST_FORM_END.', () => {
          expect(acts.RESET_REFUND_REQUEST_FORM_END).to.equal(
            '@@refund/request/RESET_REFUND_REQUEST_FORM_END')
        })

        // TODO: reset refund needs a thunk test like this validateLookup thunk test:
      })

      describe('Lookup Reference Data Actions and Subactions', () => {

        describe('Reset Refund Request Form Actions', () => {

          describe('resetRefundRequestFormStart', () => {
            it('Expected to export a constant RESET_REFUND_REQUEST_FORM_START.', () => {
              expect(acts.RESET_REFUND_REQUEST_FORM_START).to.equal(
                '@@refund/request/RESET_REFUND_REQUEST_FORM_START')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.resetRefundRequestFormStart).to.be.a('function')
            })

            it('Expected to return an action with type "RESET_REFUND_REQUEST_FORM_START".', () => {
              expect(acts.resetRefundRequestFormStart())
                .to.have.property('type', acts.RESET_REFUND_REQUEST_FORM_START)
            })

            it('Mutate state through reducer expected to set refund form `reseting` truth', () => {
              const testStartState           = cloneDeep(acts.initialState)
              const expected                 = cloneDeep(testStartState)
              expected.isResettingRefundForm = true;

              const state = refundRequestReducer(testStartState,
                acts.resetRefundRequestFormStart())

              expect(state).to.eql(expected)
            })
          })

          describe('resetRefundRequestFormEnd', () => {
            it('Expected to export a constant RESET_REFUND_REQUEST_FORM_END.', () => {
              expect(acts.RESET_REFUND_REQUEST_FORM_END).to.equal(
                '@@refund/request/RESET_REFUND_REQUEST_FORM_END')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.resetRefundRequestFormEnd).to.be.a('function')
            })

            it('Expected to return an action with type "RESET_REFUND_REQUEST_FORM_END".', () => {
              expect(acts.resetRefundRequestFormEnd())
                .to.have.property('type', acts.RESET_REFUND_REQUEST_FORM_END)
            })

            it('Mutate state through reducer expected to indicate refund form finished`reseting`',
              () => {
                const testStartState = cloneDeep(acts.initialState)
                const expected       = cloneDeep(testStartState)
                let state            = refundRequestReducer(testStartState,
                  acts.resetRefundRequestFormStart())
                state                = refundRequestReducer(state, acts.resetRefundRequestFormEnd())

                expect(state).to.eql(expected)
              })

          })

          describe('resetRefundRequestForm (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.resetRefundRequestForm).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.resetRefundRequestForm()).to.be.a('function')
            })

            it('Thunk expected to return void.', () => {
              return expect(acts.resetRefundRequestForm()(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Confirm all expected thunk dispatches', () => {
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

            it('Final state mutation expected to be issue-free.', () => {
              const expected = cloneDeep(acts.initialState)
              acts.resetRefundRequestForm()(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
          })
        })

        describe('Payment History Actions', () => {

          describe('loadPaymentHistoryDataStart', () => {
            it('Expected to export a constant LOAD_PAYMENT_HISTORY_DATA_START.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_START).to.equal(
                '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_START')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadPaymentHistoryDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_PAYMENT_HISTORY_DATA_STARTED".',
              () => {
                expect(acts.loadPaymentHistoryDataStart())
                  .to.have.property('type', acts.LOAD_PAYMENT_HISTORY_DATA_START)
              })

            it('Mutate state through reducer expected to produce history `loading` truth', () => {
              const testStartState                               = cloneDeep(acts.initialState)
              const expected                                     = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingPaymentHistory = true;

              const state = refundRequestReducer(testStartState, acts.loadPaymentHistoryDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('loadPaymentHistoryDataLoaded', () => {
            it('Expected to export a constant LOAD_PAYMENT_HISTORY_DATA_LOADED.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_LOADED).to.equal(
                '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_LOADED')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadPaymentHistoryDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_PAYMENT_HISTORY_DATA_LOADED".', () => {
              expect(acts.loadPaymentHistoryDataLoaded(paymentHistoryData))
                .to.have.property('type', acts.LOAD_PAYMENT_HISTORY_DATA_LOADED)
            })

            it('Expected to assign the first argument to `payload` property.', () => {
              expect(acts.loadPaymentHistoryDataLoaded(paymentHistoryData))
                .to.have.property('payload').and.eql(paymentHistoryData)
            })

            it('Mutate state through reducer expected to produce payment history', () => {
              const testStartState                 = cloneDeep(acts.initialState)
              const expected                       = cloneDeep(testStartState)
              expected.refundRequestForm.fees.data = paymentHistoryData[0].items
              let state                            = refundRequestReducer(testStartState,
                acts.loadPaymentHistoryDataStart())
              state                                =
                refundRequestReducer(state, acts.loadPaymentHistoryDataLoaded(paymentHistoryData))

              expect(state).to.eql(expected)
            })
          })

          describe('loadPaymentHistoryDataIssue (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Expected to export a constant LOAD_PAYMENT_HISTORY_DATA_ISSUE.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE).to.equal(
                '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadPaymentHistoryDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadPaymentHistoryDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('Thunk expected to return void.', () => {
              return expect(
                acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Confirm all expected thunk dispatches', () => {
              acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
            })

            it('Final state mutation expected to contain issue report.', () => {
              const expected                          = cloneDeep(acts.initialState)
              expected.isIssue                        = true
              expected.issueReport                    = [requestIssueReport]
              expected.refundRequestForm.fees.isIssue = true
              acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
          })

          describe('loadPaymentHistoryData (thunk)', () => {
            const stateHolder                          = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupData)
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext                    = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest                             =
                cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm                  = cloneDeep(lookupData);
              stateHolder.state.refundRequest.refundRequestForm.fees.data = null;
              dispatchSpy.reset()
              getStateSpy.reset()
              fetchMock.restore() // mocking setup using fully configured request in fluentRequest.
              setRootContext('', originalRootContext)
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadPaymentHistoryData).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadPaymentHistoryData()).to.be.a('function')
            })

            it('Thunk expected to return a Promise.', () => {
              return expect(acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Confirm all expected thunk dispatches', () => {
              return acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_PAYMENT_HISTORY_DATA_START
                  })
                  expect(dispatchSpy).to.have.been.calledWith({
                    type:    acts.LOAD_PAYMENT_HISTORY_DATA_LOADED,
                    payload: paymentHistoryData
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
                })
            })

            it('Final state mutation expected to contain payment history fees.', () => {
              const expected                       = cloneDeep(acts.initialState)
              expected.lookupForm                  = lookupData
              expected.refundRequestForm.fees.data = paymentHistoryData[0].items
              return acts.loadPaymentHistoryData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })

            describe("Confirm bad data raises 'Bad data response' issue report", () => {
              it("Expect not an Object, therefore not 'strict' JSON", () => {
                fetchMock.restore()
                const response = {
                  body:    JSON.stringify("yow!"),
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
                      type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type:    acts.ISSUE_RAISED,
                      payload: {
                        statusCode: 700,
                        statusText: 'Bad data response'
                      }
                    })
                    // mocking setup using fully configured request in fluentRequest.
                    expect(fetchMock.called(paymentHistoryAPI.format())).to.be.true
                  })
              })

              it("Expect JSON parser failure", () => {
                fetchMock.restore()
                const response = {
                  body:    "'yow!',",
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
                      type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type:    acts.ISSUE_RAISED,
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
        })

        describe('Name Actions', () => {

          describe('loadNamesDataStart', () => {

            it('Expected to export a constant LOAD_NAMES_START.', () => {
              expect(acts.LOAD_NAMES_START).to.equal('@@refund/request/LOAD_NAMES_START')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadNamesDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_NAMES_START".', () => {
              expect(acts.loadNamesDataStart())
                .to.have.property('type', acts.LOAD_NAMES_START)
            })

            it('Mutate state through reducer expected to produce `loading` truth', () => {
              const testStartState                      = cloneDeep(acts.initialState)
              const expected                            = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingNames = true;

              const state = refundRequestReducer(testStartState, acts.loadNamesDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('loadNamesDataLoaded', () => {

            it('Expected to export a constant LOAD_NAMES_ISSUE.', () => {
              expect(acts.LOAD_NAMES_ISSUE).to.equal('@@refund/request/LOAD_NAMES_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadNamesDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_NAMES_LOADED".', () => {
              expect(acts.loadNamesDataLoaded(namesData))
                .to.have.property('type', acts.LOAD_NAMES_LOADED)
            })

            it('Expected to assign names to `payload` property.', () => {
              expect(acts.loadNamesDataLoaded(namesData))
                .to.have.property('payload').and.eql(namesData)
            })

            it('Mutate state through reducer expected to produce names', () => {
              const testStartState                  = cloneDeep(acts.initialState)
              const expected                        = cloneDeep(testStartState)
              expected.refundRequestForm.names.data = namesData

              let state = refundRequestReducer(testStartState, acts.loadNamesDataStart())
              state     = refundRequestReducer(state, acts.loadNamesDataLoaded(namesData))

              expect(state).to.eql(expected)
            })
          })

          describe('loadNamesDataIssue (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Expected to export a constant LOAD_NAMES_ISSUE.', () => {
              expect(acts.LOAD_NAMES_ISSUE).to.equal('@@refund/request/LOAD_NAMES_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadNamesDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadNamesDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('Thunk expected to return void.', () => {
              return expect(acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Confirm all expected thunk dispatches', () => {
              acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_NAMES_ISSUE,
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
            })

            it('Final state mutation expected to contain issue report.', () => {
              const expected                           = cloneDeep(acts.initialState)
              expected.isIssue                         = true
              expected.issueReport                     = [requestIssueReport]
              expected.refundRequestForm.names.isIssue = true
              acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })

          })

          describe('loadNamesData (thunk)', () => {

            const stateHolder                          = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupData)
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext                    = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest                              =
                cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm                   = cloneDeep(lookupData)
              stateHolder.state.refundRequest.refundRequestForm.names.data = null
              dispatchSpy.reset()
              getStateSpy.reset()
              fetchMock.restore()  // mocking setup using fully configured request in fluentRequest.
              setRootContext('', originalRootContext)
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadNamesData).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadNamesData()).to.be.a('function')
            })

            it('Thunk expected to return a Promise.', () => {
              return expect(acts.loadNamesData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Confirm all expected thunk dispatches', () => {
              return acts.loadNamesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_NAMES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type:    acts.LOAD_NAMES_LOADED,
                    payload: namesData
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(namesAPI.format())).to.be.true
                })
            })

            it('Final state mutation expected to contain list of names.', () => {
              const expected                        = cloneDeep(acts.initialState)
              expected.lookupForm                   = lookupData
              expected.refundRequestForm.names.data = namesData
              return acts.loadNamesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })

            describe("Confirm bad data raises 'Bad data response' issue report", () => {
              it("Expect not an Object, therefore not 'strict' JSON", () => {
                fetchMock.restore()
                const response = {
                  body:    JSON.stringify("yow!"),
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                  }
                }
                fetchMock.mock(namesAPI.format(), 'GET', response)
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
                    expect(dispatchSpy).to.have.callCount(4)
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_NAMES_START
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_NAMES_ISSUE,
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type:    acts.ISSUE_RAISED,
                      payload: {
                        statusCode: 700,
                        statusText: 'Bad data response'
                      }
                    })
                    // mocking setup using fully configured request in fluentRequest.
                    expect(fetchMock.called(namesAPI.format())).to.be.true
                  })
              })

              it("Expect JSON parser failure", () => {
                fetchMock.restore()
                const response = {
                  body:    "'yow!',",
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                  }
                }
                fetchMock.mock(namesAPI.format(), 'GET', response)
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
                    expect(dispatchSpy).to.have.callCount(4)
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_NAMES_START
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_NAMES_ISSUE,
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type:    acts.ISSUE_RAISED,
                      payload: {
                        statusCode: 700,
                        statusText: 'Bad data response'
                      }
                    })
                    // mocking setup using fully configured request in fluentRequest.
                    expect(fetchMock.called(namesAPI.format())).to.be.true
                  })
              })
            })
          })
        })

        describe('Addresses Actions', () => {

          describe('loadAddressesDataStart', () => {
            it('Expected to export a constant LOAD_ADDRESSES_START.', () => {
              expect(acts.LOAD_ADDRESSES_START).to.equal('@@refund/request/LOAD_ADDRESSES_START')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadAddressesDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_ADDRESSES_START".', () => {
              expect(acts.loadAddressesDataStart())
                .to.have.property('type', acts.LOAD_ADDRESSES_START)
            })

            it('Mutate state through reducer expected to produce `loading` truth', () => {
              const testStartState                          = cloneDeep(acts.initialState)
              const expected                                = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingAddresses = true;

              const state = refundRequestReducer(testStartState, acts.loadAddressesDataStart())

              expect(state).to.eql(expected)
            })

          })

          describe('loadAddressesDataLoaded', () => {
            it('Expected to export a constant LOAD_ADDRESSES_LOADED.', () => {
              expect(acts.LOAD_ADDRESSES_LOADED).to.equal('@@refund/request/LOAD_ADDRESSES_LOADED')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadAddressesDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_ADDRESSES_LOADED".', () => {
              expect(acts.loadAddressesDataLoaded(addressesData))
                .to.have.property('type', acts.LOAD_ADDRESSES_LOADED)
            })

            it('Expected to assign the first argument to `payload` property.', () => {
              expect(acts.loadAddressesDataLoaded(addressesData))
                .to.have.property('payload').and.eql(addressesData)
            })

            it('Mutate state through reducer expected to produce addresses', () => {
              const testStartState                      = cloneDeep(acts.initialState)
              const expected                            = cloneDeep(testStartState)
              expected.refundRequestForm.addresses.data = addressesData

              let state = refundRequestReducer(testStartState, acts.loadAddressesDataStart())
              state     = refundRequestReducer(state, acts.loadAddressesDataLoaded(addressesData))

              expect(state).to.eql(expected)
            })
          })

          describe('loadAddressesDataIssue (thunk)', () => {
            const stateHolder = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)

            afterEach(() => {
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Expected to export a constant LOAD_ADDRESSES_ISSUE.', () => {
              expect(acts.LOAD_ADDRESSES_ISSUE).to.equal('@@refund/request/LOAD_ADDRESSES_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadAddressesDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadAddressesDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('Thunk expected to return void.', () => {
              return expect(
                acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Confirm all expected thunk dispatches', () => {
              acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_ADDRESSES_ISSUE,
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
            })

            it('Final state mutation expected to contain issue report.', () => {
              const expected                               = cloneDeep(acts.initialState)
              expected.isIssue                             = true
              expected.issueReport                         = [requestIssueReport]
              expected.refundRequestForm.addresses.isIssue = true
              acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(stateHolder.state.refundRequest).to.eql(expected)
            })
          })

          describe('loadAddressesData (thunk)', () => {
            const stateHolder                          = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupData)
            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext                    = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest                                  =
                cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm                       =
                cloneDeep(lookupData)
              stateHolder.state.refundRequest.refundRequestForm.addresses.data = null;
              dispatchSpy.reset()
              getStateSpy.reset()
              // mocking setup using fully configured request in fluentRequest.
              fetchMock.restore()
              setRootContext('', originalRootContext)
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.loadAddressesData).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.loadAddressesData()).to.be.a('function')
            })

            it('Thunk expected to return a Promise.', () => {
              return expect(acts.loadAddressesData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Confirm all expected thunk dispatches', () => {
              return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(dispatchSpy).to.have.been.calledTwice
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type: acts.LOAD_ADDRESSES_START
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type:    acts.LOAD_ADDRESSES_LOADED,
                    payload: addressesData
                  })
                  // mocking setup using fully configured request in fluentRequest.
                  expect(fetchMock.called(addressesAPI.format())).to.be.true
                })
            })

            it('Final state mutation expected to contain list of addresses.', () => {
              const expected                            = cloneDeep(acts.initialState)
              expected.lookupForm                       = lookupData
              expected.refundRequestForm.addresses.data = addressesData
              return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                .then(() => {
                  expect(stateHolder.state.refundRequest).to.eql(expected)
                })
            })

            describe("Confirm bad data raises 'Bad data response' issue report", () => {
              it("Expect not an Object, therefore not 'strict' JSON", () => {
                fetchMock.restore()
                const response = {
                  body:    JSON.stringify("yow!"),
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                  }
                }
                fetchMock.mock(addressesAPI.format(), 'GET', response)
                stateHolder.state.refundRequest.isNegativeTesting = true;
                return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                  .catch(() => {
                    // Expect that any exception associated with a request is handled
                    // without spreading the contagion.
                    expect.fail()
                  })
                  .then(() => {
                    expect(dispatchSpy).to.have.callCount(4)
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_ADDRESSES_START
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_ADDRESSES_ISSUE
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type:    acts.ISSUE_RAISED,
                      payload: {
                        statusCode: 700,
                        statusText: 'Bad data response'
                      }
                    })
                    // // mocking setup using fully configured request in fluentRequest.
                    expect(fetchMock.called(addressesAPI.format())).to.be.true
                  })
              })

              it("Expect JSON parser failure", () => {
                fetchMock.restore()
                const response = {
                  body:    "'yow!',",
                  headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                  }
                }
                fetchMock.mock(addressesAPI.format(), 'GET', response)
                stateHolder.state.refundRequest.isNegativeTesting = true;
                return acts.loadAddressesData()(dispatchSpy, getStateSpy)
                  .catch(() => {
                    // Expect that any exception associated with a request is handled
                    // without spreading the contagion.
                    expect.fail()
                  })
                  .then(() => {
                    expect(dispatchSpy).to.have.callCount(4)
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_ADDRESSES_START
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type: acts.LOAD_ADDRESSES_ISSUE
                    })
                    expect(dispatchSpy).to.have.been.calledWithExactly({
                      type:    acts.ISSUE_RAISED,
                      payload: {
                        statusCode: 700,
                        statusText: 'Bad data response'
                      }
                    })
                    // mocking setup using fully configured request in fluentRequest.
                    expect(fetchMock.called(addressesAPI.format())).to.be.true
                  })
              })
            })
          })
        })

        describe('Lookup Reference Data Actions', () => {
          describe('lookupReferencedDataStart', () => {
            it('Expected to export a constant LOOKUP_REFERENCED_DATA_START.', () => {
              expect(acts.LOOKUP_REFERENCED_DATA_START).to.equal(
                '@@refund/request/LOOKUP_REFERENCED_DATA_START')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.lookupReferencedDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOOKUP_REFERENCED_DATA_START".', () => {
              expect(acts.lookupReferencedDataStart())
                .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_START)
            })

            it('Mutate state through reducer expected to retain lookupForm `loading` truth', () => {
              const testStartState            = cloneDeep(acts.initialState)
              const expected                  = cloneDeep(testStartState)
              expected.lookupForm             = cloneDeep(lookupData)
              expected.lookupForm.isLookingUp = true

              let state = refundRequestReducer(testStartState, acts.validLookupStart(lookupData))
              state     = refundRequestReducer(state, acts.lookupReferencedDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('lookupReferencedDataLoaded', () => {
            it('Expected to export a constant LOOKUP_REFERENCED_DATA_LOADED.', () => {
              expect(acts.LOOKUP_REFERENCED_DATA_LOADED)
                .to.equal('@@refund/request/LOOKUP_REFERENCED_DATA_LOADED')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.lookupReferencedDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOOKUP_REFERENCED_DATA_LOADED".', () => {
              expect(acts.lookupReferencedDataLoaded())
                .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_LOADED)
            })

            it('Mutate state through reducer expected to produce lookup data', () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected       = cloneDeep(testStartState)

              const state = refundRequestReducer(testStartState, acts.lookupReferencedDataLoaded())

              expect(state).to.eql(expected)
            })
          })

          describe('lookupReferencedDataIssue', () => {
            it('Expected to export a constant LOOKUP_REFERENCED_DATA_ISSUE.', () => {
              expect(acts.LOOKUP_REFERENCED_DATA_ISSUE).to.equal(
                '@@refund/request/LOOKUP_REFERENCED_DATA_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.lookupReferencedDataIssue).to.be.a('function')
            })

            it('Expected to return an action with type "LOOKUP_REFERENCED_DATA_ISSUE".', () => {
              expect(acts.lookupReferencedDataIssue())
                .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_ISSUE)
            })

            it('Mutate state through reducer expected to retain lookupForm `issue`', () => {
              const testStartState        = cloneDeep(acts.initialState)
              const expected              = cloneDeep(testStartState)
              expected.lookupForm.isIssue = true

              let state = refundRequestReducer(testStartState, acts.lookupReferencedDataStart())
              state     = refundRequestReducer(state, acts.lookupReferencedDataIssue())

              expect(state).to.eql(expected)
            })
          })

          describe('lookupReferencedData (thunk)', () => {
            const stateHolder                          = {
              state: {
                refundRequest: cloneDeep(acts.initialState)
              }
            }
            stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupData)

            const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)
            let originalRootContext = null;

            beforeEach(() => {
              originalRootContext = setRootContext('', url.parse(baseAPI))
            })

            afterEach(() => {
              stateHolder.state.refundRequest            = cloneDeep(acts.initialState)
              stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupData);
              dispatchSpy.reset()
              getStateSpy.reset()
              // mocking setup using fully configured request in fluentRequest.
              fetchMock.restore()
              setRootContext('', originalRootContext)
            })

            it('Expected to be exported as a function.', () => {
              expect(acts.lookupReferencedData).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(acts.lookupReferencedData()).to.be.a('function')
            })

            it('Thunk expected to return a Promise.', () => {
              return expect(acts.lookupReferencedData()(dispatchSpy, getStateSpy))
                .to.eventually.be.fulfilled
            })

            it('Confirm all expected thunk dispatches', () => {
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
                    type:    acts.LOAD_NAMES_LOADED,
                    payload: namesData
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type:    acts.LOAD_ADDRESSES_LOADED,
                    payload: addressesData
                  })
                  expect(dispatchSpy).to.have.been.calledWithExactly({
                    type:    acts.LOAD_PAYMENT_HISTORY_DATA_LOADED,
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

            it('Final state mutation expected to contain fees, names, addresses and entity types.',
              () => {
                const expected                            = cloneDeep(acts.initialState)
                expected.lookupForm                       = lookupData
                expected.refundRequestForm.fees.data      = paymentHistoryData[0].items
                expected.refundRequestForm.names.data     = namesData
                expected.refundRequestForm.addresses.data = addressesData
                return acts.lookupReferencedData()(dispatchSpy, getStateSpy)
                  .then(() => {
                    expect(stateHolder.state.refundRequest).to.eql(expected)
                  })
              })
          })
        })
      })

      describe('validLookupStart', () => {
        it('Expected to export a constant VALID_LOOKUP_START.', () => {
          expect(acts.VALID_LOOKUP_START).to.equal('@@refund/request/VALID_LOOKUP_START')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.validLookupStart).to.be.a('function')
        })

        it('Expected to return an action with type "VALID_LOOKUP_START".', () => {
          expect(acts.validLookupStart(cloneDeep(lookupData)))
            .to.have.property('type', acts.VALID_LOOKUP_START)
        })

        it('Mutate state through reducer expected to produce lookup `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)
          expected.lookupForm  = cloneDeep(lookupData)
          const state          = refundRequestReducer(testStartState,
            acts.validLookupStart(cloneDeep(lookupData)))

          expect(state).to.eql(expected)
        })
      })

      describe('validLookupEnd', () => {
        it('Expected to export a constant VALID_LOOKUP_END.', () => {
          expect(acts.VALID_LOOKUP_END).to.equal('@@refund/request/VALID_LOOKUP_END')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.validLookupEnd).to.be.a('function')
        })

        it('Expected to return an action with type "VALID_LOOKUP_END".', () => {
          expect(acts.validLookupEnd(cloneDeep(lookupData)))
            .to.have.property('type', acts.VALID_LOOKUP_END)
        })

        it('Mutate state through reducer expected to produce lookup `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)
          expected.lookupForm  = lookupData
          let state            = refundRequestReducer(testStartState,
            acts.validLookupStart(cloneDeep(lookupData)))
          state                = refundRequestReducer(state, acts.validLookupEnd())

          expect(state).to.eql(expected)
        })
      })

      it('Expected to be exported as a function.', () => {
        expect(acts.validLookup).to.be.a('function')
      })

      describe('validLookup (thunk)', () => {
        const stateHolder                          = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
          }
        }
        stateHolder.state.refundRequest.lookupForm = cloneDeep(lookupData)

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

        it('Expected to return a function (is a thunk).', () => {
          expect(acts.validLookup(cloneDeep(lookupData))).to.be.a('function')
        })

        it('Thunk expected to return a Promise..', () => {
          return expect(acts.validLookup(cloneDeep(lookupData))(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Confirm all expected thunk dispatches', () => {
          return acts.validLookup(cloneDeep(lookupData))(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.callCount(18)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type   : acts.VALID_LOOKUP_START,
                payload: lookupData
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
                type:    acts.LOAD_NAMES_LOADED,
                payload: namesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.LOAD_ADDRESSES_LOADED,
                payload: addressesData
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.LOAD_PAYMENT_HISTORY_DATA_LOADED,
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
          'Final state mutation expected to contain lookupData, fees, names, addresses and entity types.',
          () => {
            const expected                            = cloneDeep(acts.initialState)
            expected.lookupForm                       = lookupData
            expected.refundRequestForm.fees.data      = paymentHistoryData[0].items
            expected.refundRequestForm.names.data     = namesData
            expected.refundRequestForm.addresses.data = addressesData
            return acts.validLookup(cloneDeep(lookupData))(dispatchSpy, getStateSpy)
              .then(() => {
                expect(stateHolder.state.refundRequest).to.eql(expected)
              })
          })
      })

    })

    describe('Refund Request Actions', () => {
      describe('postRefundRequest', () => {
        it('Expected to export a constant POST_REFUND_REQUEST.', () => {
          expect(acts.POST_REFUND_REQUEST).to.equal('@@refund/request/POST_REFUND_REQUEST')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.postRefundRequest).to.be.a('function')
        })

        it('Expected to return an action with type "POST_REFUND_REQUEST".', () => {
          expect(acts.postRefundRequest())
            .to.have.property('type', acts.POST_REFUND_REQUEST)
        })

        it('Mutate state through reducer expected to produce...', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)

          expected.pdf.file          = {}
          expected.pdf.binaryContent = pdfBinaryData
          expected.isSaving          = true;
          let state                  = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state                      = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))
          state                      = refundRequestReducer(state, acts.pdfLoaded())
          state                      = refundRequestReducer(state, acts.postRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe('savedRefundRequest', () => {
        it('Expected to export a constant SAVED_REFUND_REQUEST.', () => {
          expect(acts.SAVED_REFUND_REQUEST).to.equal('@@refund/request/SAVED_REFUND_REQUEST')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.savedRefundRequest).to.be.a('function')
        })

        it('Expected to return an action with type "SAVED_REFUND_REQUEST".', () => {
          expect(acts.savedRefundRequest())
            .to.have.property('type', acts.SAVED_REFUND_REQUEST)
        })

        it('Expected to return an action with "payload.isSaving && payload.isSaved" properties.',
          () => {
            expect(acts.savedRefundRequest())
              .to.have.property('payload').and.eql({ isSaving: false, isSaved: true })
          })

        it('Mutate state through reducer expected to produce...', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)

          expected.isSaved = true;
          let state        = refundRequestReducer(testStartState, acts.loadingPdf({}))
          state            = refundRequestReducer(state, acts.pdfBinary(pdfBinaryData))
          state            = refundRequestReducer(state, acts.pdfLoaded())
          state            = refundRequestReducer(state, acts.postRefundRequest())
          state            = refundRequestReducer(state, acts.savedRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe.skip('saveRefundRequest', () => {
        const stateHolder = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
          }
        }
        const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)
        beforeEach(() => {
          fetchMock.mock('/refunds', 'POST', 'I like turtles!')
        })

        afterEach(() => {
          dispatchSpy.reset()
          getStateSpy.reset()
          // mocking setup using fully configured request in fluentRequest.
          fetchMock.restore()
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.saveRefundRequest).to.be.a('function')
        })

        it('Expected to return a function (is a thunk).', () => {
          expect(acts.saveRefundRequest('Yow')).to.be.a('function')
        })

        it('Thunk expected to return a Promise.', () => {
          return expect(acts.saveRefundRequest('Yow')(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Final state mutation expected to contain saveRefundRequest.', () => {
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
        it('Expected to export a constant RESET_STATE.', () => {
          expect(acts.RESET_STATE).to.equal('@@refund/request/RESET_STATE')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.resetState).to.be.a('function')
        })

        it('Expected to return an action with type "RESET_STATE".', () => {
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
        const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)

        afterEach(() => {
          stateHolder.state.refundRequest = cloneDeep(acts.initialState)
          dispatchSpy.reset()
          getStateSpy.reset()
        })

        it('Expected to export a constant CLEAR_ISSUE_REPORT.', () => {
          expect(acts.CLEAR_ISSUE_REPORT).to.equal('@@refund/request/CLEAR_ISSUE_REPORT')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.clearIssueReport).to.be.a('function')
        })

        it('Expected to return an action with type "CLEAR_ISSUE_REPORT".', () => {
          expect(acts.clearIssueReport())
            .to.have.property('type', acts.CLEAR_ISSUE_REPORT)
        })

        it('Mutate state through reducer expected to clear all issues in state', () => {
          acts.loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          acts.loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          acts.loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          const state = refundRequestReducer(stateHolder.state.refundRequest,
            acts.clearIssueReport())

          expect(state).to.eql(acts.initialState)
        })
      })
    })
  })
})

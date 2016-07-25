/* @flow */

import type {ActionPayloadType, RequestIssueReportType} from 'reusable/interfaces/FpngTypes'

import type {
  LookupDataType,
  NamesDataType,
  AddressesDataType,
  PaymentHistoryDataType,
  SaveRefundRequestPayloadType
} from 'routes/RefundRequest/interfaces/RefundRequestTypes'

import type {
  SystemErrorReportType,
  TimeStampedSystemErrorReportType,
  SYS_ERROR_ADDED
} from 'reusable/modules/SystemError'

import * as acts from 'routes/RefundRequest/modules/RefundRequestMod'
import refundRequestReducer, {ut} from 'routes/RefundRequest/modules/RefundRequestMod'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.
import {
  getRootContext, setRootContext
} from 'reusable/utilities/fluentRequest'
import fetchMock from 'fetch-mock'
import {reducerSpy} from '../../../reusable/testReducerUtilities.spec'
import {base64ToBinary} from 'reusable/utilities/dataUtils'
import url from 'url'
import cloneDeep from 'lodash/cloneDeep'
import MockDate from 'mockdate'
import moment from 'moment'
import uuid from 'uuid'

describe('(Route/Module) RefundRequest/RefundRequestMod', () => {
  const requestIssueReport:RequestIssueReportType = {
    statusCode:       666,
    statusText:       'The devil made me do it.',
    errorCode:        999,
    errorMessageText: ["Entering Dante's Inferno", "It's hot"],
    infoMessageText:  ["Exiting Dante's Inferno"],
    reqUrl:           url.parse('//beelzebub.com/'),
    warnMessageText:  ["Is is getting hot or is it me?"]
  }

  const mockUuid           = '00000000-dead-beef-0000-000000000000'
  const mockNowMsFromEpoch = 961041600000

  describe('Utility Functions', function () { // Can't use '() ==> here...
    this.timeout(100); // ... because this 'this' would be wrong.

    describe('convertIssueReportToSysErrorReport', () => {
      const failedAction = acts.LOOKUP_REFERENCED_DATA_ISSUE
      const expected     = {
        actionThatFailed: failedAction,
        errorMessageText: requestIssueReport.errorMessageText.join(',\n'),
        fpngErrorCode:    requestIssueReport.errorCode,
        httpStatusCode:   requestIssueReport.statusCode,
        httpStatusText:   requestIssueReport.statusText,
        reqUrl:           requestIssueReport.reqUrl
      }

      it('Expected to be a function.', () => {
        expect(ut._convertIssueReportToSysErrorReport).to.be.a('function')
      })

      it('Expected to return an object.', () => {
        expect(ut._convertIssueReportToSysErrorReport(failedAction,
          requestIssueReport)).to.be.object
      })

      it('Expected to return SystemErrorReportType data.', () => {
        expect(ut._convertIssueReportToSysErrorReport(failedAction,
          requestIssueReport))
          .to.be.eql(expected)
      })

    })
  })

  describe('Actions', function () { // Can't use '() ==> here...
    this.timeout(300); // ... because this 'this' would be wrong.

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
        "version":    0,
        "prefixName": " ",
        "firstName":  "TODD",
        "lastName":   "BLAKELY",
        "middleName": " ",
        "suffixName": " ",
        "role":       "Attorney"
      }
    ]
    const addressesData:AddressesDataType           = [
      {
        "version":               0,
        "streetLineOne":         "1560 BROADWAY STEET, SUITE 1200",
        "streetLineTwo":         " ",
        "cityName":              "DENVER",
        "geographicRegionModel": {
          "geographicRegionCategory": null,
          "geographicRegionText":     "CO ",
          "geographicRegionName":     "COLORADO"
        },
        "countryCode":           "US",
        "countryName":           "UNITED STATES",
        "postalCode":            "80202",
        "type":                  "Attorney Address"
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
    const pdfBinaryData:Uint8Array                  = base64ToBinary('Yow')

    const pdfFile           = {}
    const baseAPI           = 'http://unit-test'
    const paymentHistoryAPI = url.parse(
      baseAPI + '/paymentHistory/' + lookupData.referenceNum)
    const namesAPI          = url.parse(
      baseAPI + '/patents/' + lookupData.referenceNum + '/personNames')
    const addressesAPI      = url.parse(
      baseAPI + '/patents/' + lookupData.referenceNum + '/addresses')
    const saveRefundAPI     = url.parse(baseAPI + '/refunds')

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

    describe('System Errors', () => {

      describe('showSystemError', () => {

        it('Expected to export a constant SYSTEM_ERROR_SHOWN.', () => {
          expect(acts.SYSTEM_ERROR_SHOWN).to.equal('@@refund/request/SYSTEM_ERROR_SHOWN')
        })

        it('Expected to be exported as a function.', () => {
          expect(ut._showSystemError).to.be.a('function')
        })

        it('Expected to return an action with type "SYSTEM_ERROR_SHOWN".', () => {
          expect(ut._showSystemError())
            .to.have.property('type', acts.SYSTEM_ERROR_SHOWN)
        })

        it('Mutate state through reducer expected to produce system error `showing` truth', () => {
          const testStartState       = cloneDeep(acts.initialState)
          const expected             = cloneDeep(testStartState)
          const state                = refundRequestReducer(testStartState, ut._showSystemError())
          expected.isShowSystemError = true

          expect(state).to.eql(expected)
        })
      })

      describe('hideSystemError', () => {

        it('Expected to export a constant SYSTEM_ERROR_HIDDEN.', () => {
          expect(acts.SYSTEM_ERROR_HIDDEN).to.equal('@@refund/request/SYSTEM_ERROR_HIDDEN')
        })

        it('Expected to be exported as a function.', () => {
          expect(ut._hideSystemError).to.be.a('function')
        })

        it('Expected to return an action with type "SYSTEM_ERROR_HIDDEN".', () => {
          expect(ut._hideSystemError())
            .to.have.property('type', acts.SYSTEM_ERROR_HIDDEN)
        })

        it('Mutate state through reducer expected to produce system error not `showing`', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)
          const state          = refundRequestReducer(testStartState, ut._hideSystemError())

          expect(state).to.eql(expected)
        })
      })

      describe('systemError (thunk)', () => {
        const stateHolder                             = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
          }
        }
        // stateHolder.state.systemError.sysErrReports = cloneDeep(lookupData)
        const systemErrorReport:SystemErrorReportType = {
          actionThatFailed: acts.LOOKUP_REFERENCED_DATA_ISSUE,
          errorMessageText: ["It's hot", "Entering Dante's Inferno"].join(',\n'),
          fpngErrorCode:    666,
          httpStatusCode:   999,
          httpStatusText:   'Flip Wilson made me do it.',
          reqUrl:           url.parse('//mephistopheles.com/')
        }

        const capturedSystemError:TimeStampedSystemErrorReportType = {
          id:           mockUuid,
          receivedAt:   moment(mockNowMsFromEpoch).utc().format(),
          sysErrReport: systemErrorReport
        }

        const { dispatchSpy, getStateSpy } = reducerSpy(refundRequestReducer, stateHolder)

        beforeEach(() => {
          // Mock Date.now() including (moment!). Fixed to the ms.
          MockDate.set(mockNowMsFromEpoch)
          sinon.stub(uuid, 'v4', function () {
            return mockUuid
          })
        })

        afterEach(() => {
          MockDate.reset()
          uuid.v4.restore()
          stateHolder.state.refundRequest = cloneDeep(acts.initialState)
          dispatchSpy.reset()
          getStateSpy.reset()
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.systemError).to.be.a('function')
        })

        it('Expected to return a function (is a thunk).', () => {
          expect(acts.systemError(cloneDeep(systemErrorReport))).to.be.a('function')
        })

        it('Thunk expected to return void.', () => {
          return expect(
            acts.systemError(cloneDeep(systemErrorReport))(dispatchSpy, getStateSpy))
            .to.be.void
        })

        it('Confirm all expected thunk dispatches', () => {
          acts.systemError(cloneDeep(systemErrorReport))(dispatchSpy, getStateSpy)
          expect(dispatchSpy).to.have.callCount(2)
          expect(dispatchSpy).to.have.been.calledWithExactly({
            type: acts.SYSTEM_ERROR_SHOWN
          })
          expect(dispatchSpy).to.have.been.calledWithExactly({
            type:    SYS_ERROR_ADDED,
            payload: capturedSystemError
          })
        })

        it(
          'Final state mutation expected to contain showing system error.',
          () => {
            const expected             = cloneDeep(acts.initialState)
            expected.isShowSystemError = true
            acts.systemError(cloneDeep(systemErrorReport))(dispatchSpy, getStateSpy)
            expect(stateHolder.state.refundRequest).to.eql(expected)
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

    describe('Valid Lookup Actions And Sub-actions', () => {

      describe('Reset Refund Request Form Actions', () => {

        describe('resetRefundRequestFormStart', () => {
          it('Expected to export a constant RESET_REFUND_REQUEST_FORM_START.', () => {
            expect(acts.RESET_REFUND_REQUEST_FORM_START).to.equal(
              '@@refund/request/RESET_REFUND_REQUEST_FORM_START')
          })

          it('Expected to be exported as a function.', () => {
            expect(ut._resetRefundRequestFormStart).to.be.a('function')
          })

          it('Expected to return an action with type "RESET_REFUND_REQUEST_FORM_START".', () => {
            expect(ut._resetRefundRequestFormStart())
              .to.have.property('type', acts.RESET_REFUND_REQUEST_FORM_START)
          })

          it('Mutate state through reducer expected to set refund form `resetting` truth', () => {
            const testStartState           = cloneDeep(acts.initialState)
            const expected                 = cloneDeep(testStartState)
            expected.isResettingRefundForm = true;

            const state = refundRequestReducer(testStartState,
              ut._resetRefundRequestFormStart())

            expect(state).to.eql(expected)
          })
        })

        describe('resetRefundRequestFormEnd', () => {
          it('Expected to export a constant RESET_REFUND_REQUEST_FORM_END.', () => {
            expect(acts.RESET_REFUND_REQUEST_FORM_END).to.equal(
              '@@refund/request/RESET_REFUND_REQUEST_FORM_END')
          })

          it('Expected to be exported as a function.', () => {
            expect(ut._resetRefundRequestFormEnd).to.be.a('function')
          })

          it('Expected to return an action with type "RESET_REFUND_REQUEST_FORM_END".', () => {
            expect(ut._resetRefundRequestFormEnd())
              .to.have.property('type', acts.RESET_REFUND_REQUEST_FORM_END)
          })

          it('Mutate state through reducer expected to indicate refund form finished`reseting`',
            () => {
              const testStartState = cloneDeep(acts.initialState)
              const expected       = cloneDeep(testStartState)
              let state            = refundRequestReducer(testStartState,
                ut._resetRefundRequestFormStart())
              state                = refundRequestReducer(state, ut._resetRefundRequestFormEnd())

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

          it('Final state mutation expected to identical to initialState', () => {
            const expected = cloneDeep(acts.initialState)
            acts.resetRefundRequestForm()(dispatchSpy, getStateSpy)
            expect(stateHolder.state.refundRequest).to.eql(expected)
          })
        })
      })

      describe('Lookup Reference Data Actions and Subactions', () => {

        describe('Payment History Actions', () => {

          describe('loadPaymentHistoryDataStart', () => {
            it('Expected to export a constant LOAD_PAYMENT_HISTORY_DATA_START.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_START).to.equal(
                '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_START')
            })

            it('Expected to be exported as a function.', () => {
              expect(ut._loadPaymentHistoryDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_PAYMENT_HISTORY_DATA_STARTED".',
              () => {
                expect(ut._loadPaymentHistoryDataStart())
                  .to.have.property('type', acts.LOAD_PAYMENT_HISTORY_DATA_START)
              })

            it('Mutate state through reducer expected to produce history `loading` truth', () => {
              const testStartState                               = cloneDeep(acts.initialState)
              const expected                                     = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingPaymentHistory = true;

              const state = refundRequestReducer(testStartState,
                ut._loadPaymentHistoryDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('loadPaymentHistoryDataLoaded', () => {
            it('Expected to export a constant LOAD_PAYMENT_HISTORY_DATA_LOADED.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_LOADED).to.equal(
                '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_LOADED')
            })

            it('Expected to be exported as a function.', () => {
              expect(ut._loadPaymentHistoryDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_PAYMENT_HISTORY_DATA_LOADED".',
              () => {
                expect(ut._loadPaymentHistoryDataLoaded(paymentHistoryData))
                  .to.have.property('type', acts.LOAD_PAYMENT_HISTORY_DATA_LOADED)
              })

            it('Expected to assign the first argument to `payload` property.', () => {
              expect(ut._loadPaymentHistoryDataLoaded(paymentHistoryData))
                .to.have.property('payload').and.eql(paymentHistoryData)
            })

            it('Mutate state through reducer expected to produce payment history', () => {
              const testStartState                 = cloneDeep(acts.initialState)
              const expected                       = cloneDeep(testStartState)
              expected.refundRequestForm.fees.data = paymentHistoryData[0].items
              let state                            = refundRequestReducer(testStartState,
                ut._loadPaymentHistoryDataStart())
              state                                =
                refundRequestReducer(state, ut._loadPaymentHistoryDataLoaded(paymentHistoryData))

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

            beforeEach(() => {
              // Mock Date.now() including (moment!). Fixed to the ms.
              MockDate.set(mockNowMsFromEpoch)
              sinon.stub(uuid, 'v4', function () {
                return mockUuid
              })
            })

            afterEach(() => {
              MockDate.reset()
              uuid.v4.restore()
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Expected to export a constant LOAD_PAYMENT_HISTORY_DATA_ISSUE.', () => {
              expect(acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE).to.equal(
                '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(ut._loadPaymentHistoryDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(ut._loadPaymentHistoryDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('Thunk expected to return void.', () => {
              expect(ut._loadPaymentHistoryDataIssue(requestIssueReport)
              (dispatchSpy, getStateSpy)).to.be.void
            })

            it('Confirm all expected thunk dispatches', () => {
              ut._loadPaymentHistoryDataIssue(cloneDeep(requestIssueReport))
              (dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.callCount(5)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.SYSTEM_ERROR_SHOWN
              })

              const failedAction = acts.LOAD_PAYMENT_HISTORY_DATA_ISSUE
              const sysErrReport =
                      ut._convertIssueReportToSysErrorReport(failedAction,
                        cloneDeep(requestIssueReport))
              const capturedSystemError:TimeStampedSystemErrorReportType = {
                id:           mockUuid,
                receivedAt:   moment(mockNowMsFromEpoch).utc().format(),
                sysErrReport: sysErrReport
              }
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    SYS_ERROR_ADDED,
                payload: capturedSystemError
              })
            })

            it('Final state mutation expected to contain issue report.', () => {
              const expected                          = cloneDeep(acts.initialState)
              expected.isIssue                        = true
              expected.isShowSystemError              = true
              expected.issueReport                    = [requestIssueReport]
              expected.refundRequestForm.fees.isIssue = true
              ut._loadPaymentHistoryDataIssue(cloneDeep(requestIssueReport))(dispatchSpy,
                getStateSpy)
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
              fetchMock.restore() // mocking setup using fully configured request in
                                  // fluentRequest.
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
              expect(ut._loadNamesDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_NAMES_START".', () => {
              expect(ut._loadNamesDataStart())
                .to.have.property('type', acts.LOAD_NAMES_START)
            })

            it('Mutate state through reducer expected to produce `loading` truth', () => {
              const testStartState                      = cloneDeep(acts.initialState)
              const expected                            = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingNames = true;

              const state = refundRequestReducer(testStartState, ut._loadNamesDataStart())

              expect(state).to.eql(expected)
            })
          })

          describe('loadNamesDataLoaded', () => {

            it('Expected to export a constant LOAD_NAMES_LOADED.', () => {
              expect(acts.LOAD_NAMES_LOADED).to.equal('@@refund/request/LOAD_NAMES_LOADED')
            })

            it('Expected to be exported as a function.', () => {
              expect(ut._loadNamesDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_NAMES_LOADED".', () => {
              expect(ut._loadNamesDataLoaded(namesData))
                .to.have.property('type', acts.LOAD_NAMES_LOADED)
            })

            it('Expected to assign names to `payload` property.', () => {
              expect(ut._loadNamesDataLoaded(namesData))
                .to.have.property('payload').and.eql(namesData)
            })

            it('Mutate state through reducer expected to produce names', () => {
              const testStartState                  = cloneDeep(acts.initialState)
              const expected                        = cloneDeep(testStartState)
              expected.refundRequestForm.names.data = namesData

              let state = refundRequestReducer(testStartState, ut._loadNamesDataStart())
              state     = refundRequestReducer(state, ut._loadNamesDataLoaded(namesData))

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

            beforeEach(() => {
              // Mock Date.now() including (moment!). Fixed to the ms.
              MockDate.set(mockNowMsFromEpoch)
              sinon.stub(uuid, 'v4', function () {
                return mockUuid
              })
            })

            afterEach(() => {
              MockDate.reset()
              uuid.v4.restore()
              stateHolder.state.refundRequest = cloneDeep(acts.initialState)
              dispatchSpy.reset()
              getStateSpy.reset()
            })

            it('Expected to export a constant LOAD_NAMES_ISSUE.', () => {
              expect(acts.LOAD_NAMES_ISSUE).to.equal('@@refund/request/LOAD_NAMES_ISSUE')
            })

            it('Expected to be exported as a function.', () => {
              expect(ut._loadNamesDataIssue).to.be.a('function')
            })

            it('Expected to return a function (is a thunk).', () => {
              expect(ut._loadNamesDataIssue(requestIssueReport)).to.be.a('function')
            })

            it('Thunk expected to return void.', () => {
              return expect(ut._loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                .to.be.void
            })

            it('Confirm all expected thunk dispatches', () => {
              ut._loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
              expect(dispatchSpy).to.have.callCount(5)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.LOAD_NAMES_ISSUE,
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.ISSUE_RAISED,
                payload: requestIssueReport
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.SYSTEM_ERROR_SHOWN
              })

              const failedAction = acts.LOAD_NAMES_ISSUE
              const sysErrReport =
                      ut._convertIssueReportToSysErrorReport(failedAction,
                        cloneDeep(requestIssueReport))
              const capturedSystemError:TimeStampedSystemErrorReportType = {
                id:           mockUuid,
                receivedAt:   moment(mockNowMsFromEpoch).utc().format(),
                sysErrReport: sysErrReport
              }
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    SYS_ERROR_ADDED,
                payload: capturedSystemError
              })
            })

            it('Final state mutation expected to contain issue report.', () => {
              const expected                           = cloneDeep(acts.initialState)
              expected.isIssue                         = true
              expected.isShowSystemError              = true
              expected.issueReport                     = [requestIssueReport]
              expected.refundRequestForm.names.isIssue = true
              ut._loadNamesDataIssue(cloneDeep(requestIssueReport))
              (dispatchSpy, getStateSpy)
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
              fetchMock.restore()  // mocking setup using fully configured request in
                                   // fluentRequest.
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
              expect(ut._loadAddressesDataStart).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_ADDRESSES_START".', () => {
              expect(ut._loadAddressesDataStart())
                .to.have.property('type', acts.LOAD_ADDRESSES_START)
            })

            it('Mutate state through reducer expected to produce `loading` truth', () => {
              const testStartState                          = cloneDeep(acts.initialState)
              const expected                                = cloneDeep(testStartState)
              expected.refundRequestForm.isLoadingAddresses = true;

              const state = refundRequestReducer(testStartState, ut._loadAddressesDataStart())

              expect(state).to.eql(expected)
            })

          })

          describe('loadAddressesDataLoaded', () => {
            it('Expected to export a constant LOAD_ADDRESSES_LOADED.', () => {
              expect(acts.LOAD_ADDRESSES_LOADED).to.equal(
                '@@refund/request/LOAD_ADDRESSES_LOADED')
            })

            it('Expected to be exported as a function.', () => {
              expect(ut._loadAddressesDataLoaded).to.be.a('function')
            })

            it('Expected to return an action with type "LOAD_ADDRESSES_LOADED".', () => {
              expect(ut._loadAddressesDataLoaded(addressesData))
                .to.have.property('type', acts.LOAD_ADDRESSES_LOADED)
            })

            it('Expected to assign the first argument to `payload` property.', () => {
              expect(ut._loadAddressesDataLoaded(addressesData))
                .to.have.property('payload').and.eql(addressesData)
            })

            it('Mutate state through reducer expected to produce addresses', () => {
              const testStartState                      = cloneDeep(acts.initialState)
              const expected                            = cloneDeep(testStartState)
              expected.refundRequestForm.addresses.data = addressesData

              let state = refundRequestReducer(testStartState, ut._loadAddressesDataStart())
              state     = refundRequestReducer(state, ut._loadAddressesDataLoaded(addressesData))

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
  
              beforeEach(() => {
                // Mock Date.now() including (moment!). Fixed to the ms.
                MockDate.set(mockNowMsFromEpoch)
                sinon.stub(uuid, 'v4', function () {
                  return mockUuid
                })
              })
  
              afterEach(() => {
                MockDate.reset()
                uuid.v4.restore()
                stateHolder.state.refundRequest = cloneDeep(acts.initialState)
                dispatchSpy.reset()
                getStateSpy.reset()
              })
  
              it('Expected to export a constant LOAD_ADDRESSES_ISSUE.', () => {
                expect(acts.LOAD_ADDRESSES_ISSUE).to.equal('@@refund/request/LOAD_ADDRESSES_ISSUE')
              })
  
              it('Expected to be exported as a function.', () => {
                expect(ut._loadAddressesDataIssue).to.be.a('function')
              })
  
              it('Expected to return a function (is a thunk).', () => {
                expect(ut._loadAddressesDataIssue(requestIssueReport)).to.be.a('function')
              })
  
              it('Thunk expected to return void.', () => {
                return expect(
                  ut._loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy))
                  .to.be.void
              })
  
              it('Confirm all expected thunk dispatches', () => {
                ut._loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
                expect(dispatchSpy).to.have.callCount(5)
                expect(dispatchSpy).to.have.been.calledWithExactly({
                  type: acts.LOAD_ADDRESSES_ISSUE,
                })
                expect(dispatchSpy).to.have.been.calledWithExactly({
                  type:    acts.ISSUE_RAISED,
                  payload: requestIssueReport
                })
                expect(dispatchSpy).to.have.been.calledWithExactly({
                  type: acts.SYSTEM_ERROR_SHOWN
                })
  
                const failedAction = acts.LOAD_ADDRESSES_ISSUE
                const sysErrReport =
                        ut._convertIssueReportToSysErrorReport(failedAction,
                          cloneDeep(requestIssueReport))
                const capturedSystemError:TimeStampedSystemErrorReportType = {
                  id:           mockUuid,
                  receivedAt:   moment(mockNowMsFromEpoch).utc().format(),
                  sysErrReport: sysErrReport
                }
                expect(dispatchSpy).to.have.been.calledWithExactly({
                  type:    SYS_ERROR_ADDED,
                  payload: capturedSystemError
                })
              })
  
              it('Final state mutation expected to contain issue report.', () => {
                const expected                               = cloneDeep(acts.initialState)
                expected.isIssue                             = true
                expected.isShowSystemError              = true
                expected.issueReport                         = [requestIssueReport]
                expected.refundRequestForm.addresses.isIssue = true
                ut._loadAddressesDataIssue(cloneDeep(requestIssueReport))
                (dispatchSpy, getStateSpy)
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

        describe('lookupReferencedDataStart', () => {
          it('Expected to export a constant LOOKUP_REFERENCED_DATA_START.', () => {
            expect(acts.LOOKUP_REFERENCED_DATA_START).to.equal(
              '@@refund/request/LOOKUP_REFERENCED_DATA_START')
          })

          it('Expected to be exported as a function.', () => {
            expect(ut._lookupReferencedDataStart).to.be.a('function')
          })

          it('Expected to return an action with type "LOOKUP_REFERENCED_DATA_START".', () => {
            expect(ut._lookupReferencedDataStart())
              .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_START)
          })

          it('Mutate state through reducer expected to retain lookupForm `loading` truth', () => {
            const testStartState            = cloneDeep(acts.initialState)
            const expected                  = cloneDeep(testStartState)
            expected.lookupForm             = cloneDeep(lookupData)
            expected.lookupForm.isLookingUp = true

            let state = refundRequestReducer(testStartState, ut._validLookupStart(lookupData))
            state     = refundRequestReducer(state, ut._lookupReferencedDataStart())

            expect(state).to.eql(expected)
          })
        })

        describe('lookupReferencedDataLoaded', () => {
          it('Expected to export a constant LOOKUP_REFERENCED_DATA_LOADED.', () => {
            expect(acts.LOOKUP_REFERENCED_DATA_LOADED)
              .to.equal('@@refund/request/LOOKUP_REFERENCED_DATA_LOADED')
          })

          it('Expected to be exported as a function.', () => {
            expect(ut._lookupReferencedDataLoaded).to.be.a('function')
          })

          it('Expected to return an action with type "LOOKUP_REFERENCED_DATA_LOADED".', () => {
            expect(ut._lookupReferencedDataLoaded())
              .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_LOADED)
          })

          it('Mutate state through reducer expected to produce lookup data', () => {
            const testStartState = cloneDeep(acts.initialState)
            const expected       = cloneDeep(testStartState)

            const state = refundRequestReducer(testStartState, ut._lookupReferencedDataLoaded())

            expect(state).to.eql(expected)
          })
        })

        describe('lookupReferencedDataIssue', () => {
          it('Expected to export a constant LOOKUP_REFERENCED_DATA_ISSUE.', () => {
            expect(acts.LOOKUP_REFERENCED_DATA_ISSUE).to.equal(
              '@@refund/request/LOOKUP_REFERENCED_DATA_ISSUE')
          })

          it('Expected to be exported as a function.', () => {
            expect(ut._lookupReferencedDataIssue).to.be.a('function')
          })

          it('Expected to return an action with type "LOOKUP_REFERENCED_DATA_ISSUE".', () => {
            expect(ut._lookupReferencedDataIssue())
              .to.have.property('type', acts.LOOKUP_REFERENCED_DATA_ISSUE)
          })

          it('Mutate state through reducer expected to retain lookupForm `issue`', () => {
            const testStartState        = cloneDeep(acts.initialState)
            const expected              = cloneDeep(testStartState)
            expected.lookupForm.isIssue = true

            let state = refundRequestReducer(testStartState, ut._lookupReferencedDataStart())
            state     = refundRequestReducer(state, ut._lookupReferencedDataIssue())

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

      describe('validLookupStart', () => {
        it('Expected to export a constant VALID_LOOKUP_START.', () => {
          expect(acts.VALID_LOOKUP_START).to.equal('@@refund/request/VALID_LOOKUP_START')
        })

        it('Expected to be exported as a function.', () => {
          expect(ut._validLookupStart).to.be.a('function')
        })

        it('Expected to return an action with type "VALID_LOOKUP_START".', () => {
          expect(ut._validLookupStart(cloneDeep(lookupData)))
            .to.have.property('type', acts.VALID_LOOKUP_START)
        })

        it('Mutate state through reducer expected to produce lookup `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)
          expected.lookupForm  = cloneDeep(lookupData)
          const state          = refundRequestReducer(testStartState,
            ut._validLookupStart(cloneDeep(lookupData)))

          expect(state).to.eql(expected)
        })
      })

      describe('validLookupEnd', () => {
        it('Expected to export a constant VALID_LOOKUP_END.', () => {
          expect(acts.VALID_LOOKUP_END).to.equal('@@refund/request/VALID_LOOKUP_END')
        })

        it('Expected to be exported as a function.', () => {
          expect(ut._validLookupEnd).to.be.a('function')
        })

        it('Expected to return an action with type "VALID_LOOKUP_END".', () => {
          expect(ut._validLookupEnd(cloneDeep(lookupData)))
            .to.have.property('type', acts.VALID_LOOKUP_END)
        })

        it('Mutate state through reducer expected to produce lookup `loading` truth', () => {
          const testStartState = cloneDeep(acts.initialState)
          const expected       = cloneDeep(testStartState)
          expected.lookupForm  = lookupData
          let state            = refundRequestReducer(testStartState,
            ut._validLookupStart(cloneDeep(lookupData)))
          state                = refundRequestReducer(state, ut._validLookupEnd())

          expect(state).to.eql(expected)
        })
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

        it('Expected to be exported as a function.', () => {
          expect(acts.validLookup).to.be.a('function')
        })

        it('Expected to return a function (is a thunk).', () => {
          expect(acts.validLookup(cloneDeep(lookupData))).to.be.a('function')
        })

        it('Thunk expected to return a Promise.', () => {
          return expect(acts.validLookup(cloneDeep(lookupData))(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Confirm all expected thunk dispatches', () => {
          return acts.validLookup(cloneDeep(lookupData))(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.callCount(18)
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type:    acts.VALID_LOOKUP_START,
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
          const testStartState   = cloneDeep(acts.initialState)
          const expected         = cloneDeep(testStartState)
          expected.save.isSaving = true;
          const state            = refundRequestReducer(testStartState, acts.postRefundRequest())

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

        it('Mutate state through reducer expected to produce...', () => {
          const testStartState  = cloneDeep(acts.initialState)
          const expected        = cloneDeep(testStartState)
          expected.save.isSaved = true;

          let state = refundRequestReducer(testStartState, acts.postRefundRequest())
          state     = refundRequestReducer(state, acts.savedRefundRequest())

          expect(state).to.eql(expected)
        })
      })

      describe('saveRefundIssue (thunk)', () => {
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

        it('Expected to export a constant SAVED_REFUND_ISSUE.', () => {
          expect(acts.SAVED_REFUND_ISSUE).to.equal(
            '@@refund/request/SAVED_REFUND_ISSUE')
        })

        it('Expected to be exported as a function.', () => {
          expect(acts.saveRefundIssue).to.be.a('function')
        })

        it('Expected to return a function (is a thunk).', () => {
          expect(acts.saveRefundIssue(requestIssueReport)).to.be.a('function')
        })

        it('Thunk expected to return void.', () => {
          return expect(
            acts.saveRefundIssue(requestIssueReport)(dispatchSpy, getStateSpy))
            .to.be.void
        })

        it('Confirm all expected thunk dispatches', () => {
          acts.saveRefundIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          expect(dispatchSpy).to.have.been.calledTwice
          expect(dispatchSpy).to.have.been.calledWithExactly({
            type: acts.SAVED_REFUND_ISSUE
          })
          expect(dispatchSpy).to.have.been.calledWithExactly({
            type:    acts.ISSUE_RAISED,
            payload: requestIssueReport
          })
        })

        it('Final state mutation expected to contain issue report.', () => {
          const expected        = cloneDeep(acts.initialState)
          expected.isIssue      = true
          expected.save.isIssue = true
          expected.issueReport  = [requestIssueReport]
          acts.saveRefundIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          expect(stateHolder.state.refundRequest).to.eql(expected)
        })
      })

      describe('saveRefundRequest (thunk)', () => {
        const stateHolder       = {
          state: {
            refundRequest: cloneDeep(acts.initialState)
          }
        }
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

        it('Expected to be exported as a function.', () => {
          expect(acts.saveRefundRequest).to.be.a('function')
        })

        it('Expected to return a function (is a thunk).', () => {
          expect(acts.saveRefundRequest()).to.be.a('function')
        })

        it('Thunk expected to return a Promise.', () => {
          return expect(acts.saveRefundRequest()(dispatchSpy, getStateSpy))
            .to.eventually.be.fulfilled
        })

        it('Confirm all expected thunk dispatches', () => {
          return acts.saveRefundRequest()(dispatchSpy, getStateSpy)
            .then(() => {
              expect(dispatchSpy).to.have.been.calledTwice
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.POST_REFUND_REQUEST
              })
              expect(dispatchSpy).to.have.been.calledWithExactly({
                type: acts.SAVED_REFUND_REQUEST,
              })
              // mocking setup using fully configured request in fluentRequest.
              expect(fetchMock.called(saveRefundAPI.format())).to.be.true
            })
        })

        it('Final state mutation expected to contain saveRefundRequest.', () => {
          const expected = cloneDeep(acts.initialState)
          return acts.saveRefundRequest()(dispatchSpy, getStateSpy)
            .then(() => {
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
          ut._loadPaymentHistoryDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          ut._loadNamesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          ut._loadAddressesDataIssue(requestIssueReport)(dispatchSpy, getStateSpy)
          const state = refundRequestReducer(stateHolder.state.refundRequest,
            acts.clearIssueReport())

          expect(state).to.eql(acts.initialState)
        })
      })
    })
  })
})

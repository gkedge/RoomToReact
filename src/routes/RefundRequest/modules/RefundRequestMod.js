/* @flow */

// TODO: might be able to remove some the serious amount of boiler plate going
// on in here with: https://github.com/acdlite/redux-actions

import type {
  ActionPayloadType,
  RequestIssueReportType,
  RequestIssuePayloadType
} from 'reusable/interfaces/FpngTypes'

import type {
  LookupPayloadType,
  PdfLoadingPayloadType,
  LookupDataType,
  NamesDataType,
  NamesPayloadType,
  AddressesDataType,
  AddressesPayloadType,
  PaymentHistoryDataType,
  PaymentHistoryDataPayloadType,
  PdfReadPayloadType,
  SaveRefundRequestPayloadType,
  RefundRequestStateType
} from '../interfaces/RefundRequestTypes'

import type {
  SystemErrorReportType,
  raiseSystemError
} from 'reusable/modules/SystemError'

import _debug from 'debug'
import {reset} from 'redux-form'
import url from 'url'
import cloneDeep from 'lodash/cloneDeep'
import isString from 'lodash/isString'

import {
  get, post, put,
  getRootContext, setRootContext,
  responseFail
} from 'reusable/utilities/fluentRequest'

import {upper, lower} from 'reusable/utilities/dataUtils'
import {createReducer, unknownAction} from 'reusable/utilities/reduxStoreUtils'

// import dispatchTime from 'promise-time'
import {promiseTime as dispatchTime} from 'reusable/utilities/promisePlugins'

type RrsType = RefundRequestStateType

const debug     = _debug('refunds:RefundRequestMod:debug')
const debugTime = _debug('refunds:RefundRequestMod:time')

// ------------------------------------
// Constants
// ------------------------------------
export const LOADING_PDF                      = '@@refund/request/LOADING_PDF'
export const PDF_BINARY                       = '@@refund/request/PDF_BINARY'
export const PDF_LOADED                       = '@@refund/request/PDF_LOADED'
export const POST_REFUND_REQUEST              = '@@refund/request/POST_REFUND_REQUEST'
export const LOOKUP_REFERENCED_DATA_START     = '@@refund/request/LOOKUP_REFERENCED_DATA_START'
export const LOOKUP_REFERENCED_DATA_LOADED    = '@@refund/request/LOOKUP_REFERENCED_DATA_LOADED'
export const LOOKUP_REFERENCED_DATA_ISSUE     = '@@refund/request/LOOKUP_REFERENCED_DATA_ISSUE'
export const LOAD_ADDRESSES_START             = '@@refund/request/LOAD_ADDRESSES_START'
export const LOAD_ADDRESSES_LOADED            = '@@refund/request/LOAD_ADDRESSES_LOADED'
export const LOAD_ADDRESSES_ISSUE             = '@@refund/request/LOAD_ADDRESSES_ISSUE'
export const LOAD_NAMES_START                 = '@@refund/request/LOAD_NAMES_START'
export const LOAD_NAMES_LOADED                = '@@refund/request/LOAD_NAMES_LOADED'
export const LOAD_NAMES_ISSUE                 = '@@refund/request/LOAD_NAMES_ISSUE'
export const LOAD_PAYMENT_HISTORY_DATA_START  = '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_START'
export const LOAD_PAYMENT_HISTORY_DATA_LOADED = '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_LOADED'
export const LOAD_PAYMENT_HISTORY_DATA_ISSUE  = '@@refund/request/LOAD_PAYMENT_HISTORY_DATA_ISSUE'
export const RESET_REFUND_REQUEST_FORM_START  = '@@refund/request/RESET_REFUND_REQUEST_FORM_START'
export const RESET_REFUND_REQUEST_FORM_END    = '@@refund/request/RESET_REFUND_REQUEST_FORM_END'
export const CLEAR_ISSUE_REPORT               = '@@refund/request/CLEAR_ISSUE_REPORT'
export const RESET_STATE                      = '@@refund/request/RESET_STATE'
export const SAVED_REFUND_REQUEST             = '@@refund/request/SAVED_REFUND_REQUEST'
export const SAVED_REFUND_ISSUE               = '@@refund/request/SAVED_REFUND_ISSUE'
export const ISSUE_RAISED                     = '@@refund/request/ISSUE_RAISED'
export const VALID_LOOKUP_START               = '@@refund/request/VALID_LOOKUP_START'
export const VALID_LOOKUP_END                 = '@@refund/request/VALID_LOOKUP_END'
export const VALID_LOOKUP_ISSUE               = '@@refund/request/VALID_LOOKUP_ISSUE'
export const SYSTEM_ERROR_SHOWN               = '@@refund/request/SYSTEM_ERROR_SHOWN'
export const SYSTEM_ERROR_HIDDEN              = '@@refund/request/SYSTEM_ERROR_HIDDEN'

const _convertIssueReportToSysErrorReport =
        (failedAction:string,
         issueReport:RequestIssueReportType):SystemErrorReportType => {
          return ({
            errorMessageText: issueReport.errorMessageText.join(',\n'),
            actionThatFailed: failedAction,
            fpngErrorCode: issueReport.errorCode,
            httpStatusCode: issueReport.statusCode,
            httpStatusText: issueReport.statusText,
            reqUrl: issueReport.reqUrl
          })
        }

// ------------------------------------
// Actions
// ------------------------------------
// https://github.com/wbinnssmith/redux-normalizr-middleware

export const raiseIssue = (issueMessage:any):ActionPayloadType => {
  if (isString(issueMessage)) {
    issueMessage = {
      statusCode: 710,
      statusText: issueMessage
    }
  }
  return {
    type:    ISSUE_RAISED,
    payload: issueMessage
  }
}

const _showSystemError = ():ActionPayloadType => {
  return {
    type: SYSTEM_ERROR_SHOWN
  }
}

export const systemError = (systemErrorReport:SystemErrorReportType):Function => {
  return (dispatch:Function) => {
    dispatch(raiseSystemError(systemErrorReport))
    dispatch(_showSystemError())
  }
}

export const _hideSystemError = ():ActionPayloadType => {
  return {
    type: SYSTEM_ERROR_HIDDEN
  }
}

export const goToLogin = ():Function => {
  return (dispatch:Function) => {
    dispatch(resetRefundRequestForm())
    dispatch(clearIssueReport())
    dispatch(_hideSystemError())
  }
}

const _loadPaymentHistoryDataStart = ():ActionPayloadType => {
  return {
    type: LOAD_PAYMENT_HISTORY_DATA_START
  }
}

const _loadPaymentHistoryDataLoaded =
               (paymentHistoryData:PaymentHistoryDataType):ActionPayloadType => {
                 return {
                   type:    LOAD_PAYMENT_HISTORY_DATA_LOADED,
                   payload: paymentHistoryData
                 }
               }

const _loadPaymentHistoryDataIssue = (issueMessage:any):Function => {
  return (dispatch:Function) => {
    dispatch(raiseIssue(issueMessage))

    if (issueMessage.errorMessageText && issueMessage.errorMessageText.length) {
      var systemErrorReport =
            _convertIssueReportToSysErrorReport(LOAD_PAYMENT_HISTORY_DATA_ISSUE,
              issueMessage)
      dispatch(systemError(systemErrorReport))
    }

    dispatch({
      type: LOAD_PAYMENT_HISTORY_DATA_ISSUE
    })
  }
}

export const loadPaymentHistoryData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm          = getState().refundRequest.lookupForm
    const paymentHistoryAPI = url.parse('paymentHistory/' + lookupForm.referenceNum)
    debug('loadPaymentHistoryData: Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(_loadPaymentHistoryDataStart())
    return get(paymentHistoryAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(_loadPaymentHistoryDataLoaded(jsonData))
      })
      .catch((reason:Error):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to load payment history')
        }
        return dispatch(_loadPaymentHistoryDataIssue(reason.message))
      })
      .catch(
        (reason:Error):any /* Promise*/ => dispatch(_loadPaymentHistoryDataIssue(reason.message)))
  }
}

const _loadNamesDataStart = ():ActionPayloadType => {
  return {
    type: LOAD_NAMES_START
  }
}

const _loadNamesDataLoaded = (namesData:NamesDataType):ActionPayloadType => {
  return {
    type:    LOAD_NAMES_LOADED,
    payload: namesData
  }
}

const _loadNamesDataIssue = (issueMessage:RequestIssueReportType):Function => {
  return (dispatch:Function) => {
    dispatch(raiseIssue(issueMessage))

    if (issueMessage.errorMessageText && issueMessage.errorMessageText.length) {
      var systemErrorReport =
            _convertIssueReportToSysErrorReport(LOAD_NAMES_ISSUE, issueMessage)
      dispatch(systemError(systemErrorReport))
    }

    dispatch({
      type: LOAD_NAMES_ISSUE
    })
  }
}

export const loadNamesData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm     = getState().refundRequest.lookupForm
    const loadNamesAPI = url.parse('patents/' +
                                   lookupForm.referenceNum +
                                   '/personNames')
    debug('loadNamesData: Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(_loadNamesDataStart())

    return get(loadNamesAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(_loadNamesDataLoaded(jsonData))
      })
      .catch((reason:Error):any => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to load names associated with patent/trademark')
        }
        return dispatch(_loadNamesDataIssue(reason.message))
      })
      .catch((reason:Error):any /* Promise*/ => dispatch(_loadNamesDataIssue(reason.message)))
  }
}

const _loadAddressesDataStart = ():ActionPayloadType => {
  return {
    type: LOAD_ADDRESSES_START
  }
}

const _loadAddressesDataLoaded = (addressesData:AddressesDataType):ActionPayloadType => {
  return {
    type:    LOAD_ADDRESSES_LOADED,
    payload: addressesData
  }
}

const _loadAddressesDataIssue = (issueMessage:RequestIssueReportType):Function => {
  return (dispatch:Function) => {
    dispatch(raiseIssue(issueMessage))

    if (issueMessage.errorMessageText && issueMessage.errorMessageText.length) {
      var systemErrorReport =
            _convertIssueReportToSysErrorReport(LOAD_ADDRESSES_ISSUE, issueMessage)
      dispatch(systemError(systemErrorReport))
    }

    dispatch({
      type: LOAD_ADDRESSES_ISSUE
    })
  }
}

export const loadAddressesData:Function = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm         = getState().refundRequest.lookupForm
    const loadAddressesAPI = url.parse('patents/' +
                                       lookupForm.referenceNum +
                                       '/addresses')
    debug('loadAddressesData: Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(_loadAddressesDataStart())

    return get(loadAddressesAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(_loadAddressesDataLoaded(jsonData))
      })
      .catch((reason:Error):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to load addresses associated with patent/trademark')
        }
        return dispatch(_loadAddressesDataIssue(reason.message))
      })
      .catch((reason:Error):any /* Promise*/ => dispatch(_loadAddressesDataIssue(reason.message)))
  }
}

export const loadingPdf:Function = (pdfFile:Object):ActionPayloadType => {
  return {
    type:    LOADING_PDF,
    payload: {
      pdfFile: pdfFile
    }
  }
}

export const pdfBinary = (pdfRaw:Uint8Array):ActionPayloadType => {
  return {
    type:    PDF_BINARY,
    payload: {
      pdfRaw: pdfRaw
    }
  }
}

export const pdfLoaded = ():ActionPayloadType => {
  return {
    type: PDF_LOADED
  }
}

export const postRefundRequest = ():ActionPayloadType => {
  return {
    type:    POST_REFUND_REQUEST
  }
}

export const savedRefundRequest = ():ActionPayloadType => {
  return {
    type:    SAVED_REFUND_REQUEST
  }
}

export const saveRefundIssue = (issueMessage:RequestIssueReportType):Function => {
  return (dispatch:Function) => {
    dispatch(raiseIssue(issueMessage))
    dispatch({
      type: SAVED_REFUND_ISSUE
    })
  }
}

export const saveRefundRequest = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    dispatch(postRefundRequest())
    const postRefundAPI = url.parse('refunds')
    return post(postRefundAPI)
      .setMimeType('json')
      .json()
      .then(():any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(savedRefundRequest())
      })
      .catch((reason:Error):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to post refund.')
        }
        return dispatch(saveRefundIssue(reason.message))
      })
      .catch((reason:Error):any /* Promise*/ => dispatch(saveRefundIssue(reason.message)))
  }
}

const _lookupReferencedDataStart = ():ActionPayloadType => {
  return {
    type: LOOKUP_REFERENCED_DATA_START
  }
}

const _lookupReferencedDataLoaded = ():ActionPayloadType => {
  return {
    type: LOOKUP_REFERENCED_DATA_LOADED
  }
}

const _lookupReferencedDataIssue = ():ActionPayloadType => {
  return {
    type: LOOKUP_REFERENCED_DATA_ISSUE
  }
}

export const lookupReferencedData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    dispatch(_lookupReferencedDataStart())
    // Though not presently used, purposely showing the args for a
    // 'resolve' tied to a Promise.spread() to help understand what
    // it does very differently than a Promise.all() and provide a
    // hint if they ever are needed in the future.

    // eslint-disable-next-line no-unused-vars
    const resolve = (paymentHistoryData:?any, namesData:?any,
                     addressesData:?any):any /* Promise */ => {
      if (debugTime.enabled) {
        debugTime('lookupReferencedData time: +' + allDispatches.time + 'ms')
      }

      return dispatch(_lookupReferencedDataLoaded())
    }

    const allDispatches = ():Promise =>
      // Waaaait a minute... there ain't no spread() in the Promise spec!
      // See promisePlugins.js...
      Promise.spread(
        [
          dispatch(loadPaymentHistoryData()),
          dispatch(loadNamesData()),
          dispatch(loadAddressesData())
        ],
        resolve)
        .catch((reason:any):any /* Promise*/ => {
          if (!getState().refundRequest.isNegativeTesting) {
            responseFail(reason, 'Failed to lookup referenced data')
          }
          return dispatch(_lookupReferencedDataIssue())
        })
        .catch(():any /* Promise*/ => dispatch(_lookupReferencedDataIssue()))

    return debugTime.enabled ? dispatchTime(allDispatches)() : allDispatches()
  }
}

const _validLookupStart = (lookupFormData:LookupDataType):ActionPayloadType => {
  return {
    type:    VALID_LOOKUP_START,
    payload: lookupFormData
  }
}

const _validLookupEnd = ():ActionPayloadType => {
  return {
    type: VALID_LOOKUP_END
  }
}

const _validLookupIssue = ():ActionPayloadType => {
  return {
    type: VALID_LOOKUP_ISSUE
  }
}

export function validLookup(lookupFormData:LookupDataType):Function {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    dispatch(_validLookupStart(lookupFormData))
    dispatch(resetRefundRequestForm())

    return dispatch(lookupReferencedData())
      .then(():any /* Promise */ => dispatch(_validLookupEnd()))
      .catch((reason:any):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to validate lookup')
        }
        return dispatch(_validLookupIssue())
      })
      .catch(():any /* Promise*/ => dispatch(_validLookupIssue()))
  }
}

export const clearIssueReport = ():ActionPayloadType => {
  return {
    type: CLEAR_ISSUE_REPORT
  }
}

export const resetState = ():ActionPayloadType => {
  return {
    type: RESET_STATE
  }
}

const _resetRefundRequestFormStart = ():ActionPayloadType => {
  return {
    type: RESET_REFUND_REQUEST_FORM_START
  }
}

const _resetRefundRequestFormEnd = ():ActionPayloadType => {
  return {
    type: RESET_REFUND_REQUEST_FORM_END
  }
}

export const resetRefundRequestForm = ():Function => {
  return (dispatch:Function) => {
    dispatch(_resetRefundRequestFormStart())
    // TODO: Hope this isn't async... Check.
    dispatch(reset('resetRefundRequestForm'))
    dispatch(_resetRefundRequestFormEnd())
  }
}

// Private functions that are solely exposed for UT'ing purposes
export const ut = {
  _convertIssueReportToSysErrorReport,
  _loadPaymentHistoryDataStart,
  _loadPaymentHistoryDataLoaded,
  _loadPaymentHistoryDataIssue,
  _loadNamesDataStart,
  _loadNamesDataLoaded,
  _loadNamesDataIssue,
  _loadAddressesDataStart,
  _loadAddressesDataLoaded,
  _loadAddressesDataIssue,
  _lookupReferencedDataStart,
  _lookupReferencedDataLoaded,
  _lookupReferencedDataIssue,
  _resetRefundRequestFormStart,
  _resetRefundRequestFormEnd,
  _showSystemError,
  _hideSystemError,
  _validLookupStart,
  _validLookupEnd,
  _validLookupIssue
}

/*eslint "key-spacing": 0*/
const LOAD_REFUND_REQUEST_ACTION_HANDLERS = {
  [ISSUE_RAISED]:                     (state:RrsType,
                                       action:{payload: RequestIssueReportType}):RrsType => {
    const issueReport = cloneDeep(state.issueReport)
    issueReport.push(action.payload)
    return ({
      ...state,
      isIssue:     true,
      issueReport: issueReport
    })
  },
  [LOAD_ADDRESSES_START]:             (state:RrsType):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingAddresses: true
      }
    })
  },
  [LOAD_ADDRESSES_LOADED]:            (state:RrsType,
                                       action:{payload: AddressesPayloadType}):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingAddresses: false,
        addresses:          {
          ...state.refundRequestForm.addresses,
          data: action.payload
        }
      }
    })
  },
  [LOAD_ADDRESSES_ISSUE]:             (state:RrsType):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingAddresses: false,
        addresses:          {
          ...state.refundRequestForm.addresses,
          isIssue: true
        }
      }
    })
  },
  [LOAD_NAMES_START]:                 (state:RrsType):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingNames: true
      }
    })
  },
  [LOAD_NAMES_LOADED]:                (state:RrsType,
                                       action:{payload: NamesPayloadType}):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingNames: false,
        names:          {
          ...state.refundRequestForm.names,
          data: action.payload
        }
      }
    })
  },
  [LOAD_NAMES_ISSUE]:                 (state:RrsType):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingNames: false,
        names:          {
          ...state.refundRequestForm.names,
          isIssue: true
        }
      }
    })
  },
  [LOAD_PAYMENT_HISTORY_DATA_START]:  (state:RrsType):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingPaymentHistory: true
      }
    })
  },
  [LOAD_PAYMENT_HISTORY_DATA_LOADED]: (state:RrsType,
                                       action:{payload: PaymentHistoryDataPayloadType}):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingPaymentHistory: false,
        fees:                    {
          ...state.refundRequestForm.fees,
          data: action.payload[0].items
        }
      }
    })
  },
  [LOAD_PAYMENT_HISTORY_DATA_ISSUE]:  (state:RrsType):RrsType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingPaymentHistory: false,
        fees:                    {
          ...state.refundRequestForm.fees,
          isIssue: true
        }
      }
    })
  },
  [LOADING_PDF]:                      (state:RrsType,
                                       action:{payload: PdfLoadingPayloadType}):RrsType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        isLoading: true,
        file:      action.payload.pdfFile
      }
    })
  },
  [LOOKUP_REFERENCED_DATA_START]:     (state:RrsType):RrsType => {
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isLookingUp: true
      }
    })
  },
  [LOOKUP_REFERENCED_DATA_LOADED]:    (state:RrsType):RrsType => {
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isLookingUp: false
      }
    })
  },
  [LOOKUP_REFERENCED_DATA_ISSUE]:     (state:RrsType):RrsType => {
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isIssue:     true,
        isLookingUp: false
      }
    })
  },
  [PDF_BINARY]:                       (state:RrsType,
                                       action:{payload: PdfReadPayloadType}):RrsType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        binaryContent: action.payload.pdfRaw
      }
    })
  },
  [PDF_LOADED]:                       (state:RrsType):RrsType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        isLoading: false
      }
    })
  },
  [RESET_REFUND_REQUEST_FORM_START]:  (state:RrsType):RrsType => {
    return ({
      ...state,
      isResettingRefundForm: true,
      refundRequestForm:     initialState.refundRequestForm
    })
  },
  [RESET_REFUND_REQUEST_FORM_END]:    (state:RrsType):RrsType => {
    return ({
      ...state,
      isResettingRefundForm: false
    })
  },
  [POST_REFUND_REQUEST]:              (state:RrsType):RrsType => {
    return ({
      ...state,
      save: {
        ...state.save,
        isSaving: true,
        isSaved:  false
      }
    })
  },
  [SAVED_REFUND_REQUEST]:             (state:RrsType):RrsType => {
    return ({
      ...state,
      save: {
        ...state.save,
        isSaving: false,
        isSaved:  true
      }
    })
  },
  [SAVED_REFUND_ISSUE]:               (state:RrsType):RrsType => {
    return ({
      ...state,
      save: {
        ...state.save,
        isSaving: false,
        isIssue:  true
      }
    })
  },
  [CLEAR_ISSUE_REPORT]:               (state:RrsType):RrsType => {
    return ({
      ...state,
      isIssue:           false,
      isShowSystemError: false,
      issueReport:       [],
      lookupForm:        {
        ...state.lookupForm,
        isIssue: false
      },

      refundRequestForm: {
        ...state.refundRequestForm,
        fees:      {
          ...state.refundRequestForm.fees,
          isIssue: false
        },
        addresses: {
          ...state.refundRequestForm.addresses,
          isIssue: false
        },
        names:     {
          ...state.refundRequestForm.names,
          isIssue: false
        }
      }
    })
  },
  [RESET_STATE]:                      ():RrsType => {
    return ({
      ...initialState
    })
  },
  [VALID_LOOKUP_START]:               (state:RrsType,
                                       action:{payload: LookupPayloadType}):RrsType => {
    const payload    = action.payload
    let referenceNum = payload.referenceNum
    // Strip any slashes or commas
    referenceNum     = referenceNum.replace(/,/g, '')
    referenceNum.length < 18
      ? referenceNum.replace(/\//g, '')
      : referenceNum
    payload.referenceNum = upper(referenceNum)
    // TODO: normalize API not published yet in redux-form@6.0.0-alpha-15 so
    // Notice 'case' normalizing here!  Once normalize API is published
    // I am hoping that the lower()/upper() can be removed here.
    // See redux-form filed definitions in LookupForm renderer.
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        referenceNum: payload.referenceNum,
        dateFrom:     payload.dateFrom,
        dateTo:       payload.dateTo,
        email:        lower(payload.email)
      }
    })
  },
  [VALID_LOOKUP_END]:                 (state:RrsType):RrsType => {
    return state
  },
  [VALID_LOOKUP_ISSUE]:               (state:RrsType):RrsType => {
    return state
  },
  [SYSTEM_ERROR_SHOWN]:               (state:RrsType):RrsType => {
    return ({
      ...state,
      isShowSystemError: true
    })
  },
  [SYSTEM_ERROR_HIDDEN]:              (state:RrsType):RrsType => {
    return ({
      ...state,
      isShowSystemError: false
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------
export const initialState:RrsType = {
  pdf:                   {
    isError:       false,
    isLoading:     false,
    file:          null,
    content:       null,
    binaryContent: null,
    page:          0,
    scale:         0
  },
  lookupForm:            {
    isIssue:      false,
    issueReport:  [],
    isLookingUp:  false,
    referenceNum: null,
    dateFrom:     null,
    dateTo:       null,
    email:        null
  },
  refundRequestForm:     {
    fees:                    {
      isIssue: false,
      data:    null
    },
    depositAccountNum:       null,
    reason:                  null,
    rationale:               null,
    name:                    {
      found: false,
      name:  null
    },
    names:                   {
      isIssue: false,
      data:    null
    },
    address:                 {
      found:   false,
      address: null
    },
    addresses:               {
      isIssue: false,
      data:    null
    },
    isLoadingPaymentHistory: false,
    isLoadingNames:          false,
    isLoadingAddresses:      false,
    phone:                   null,
    attorneyDocketNum:       null,
    acknowledgement:         false,
    requestDate:             null
  },
  save:                  {
    isIssue:               false,
    isSaving:              false,
    isSaved:               false
  },
  isIssue:               false,
  isShowSystemError:     false,
  isResettingRefundForm: false,
  isNegativeTesting:     false,
  issueReport:           []
}

const reducer = createReducer(initialState, LOAD_REFUND_REQUEST_ACTION_HANDLERS)
export default function (state:RrsType = initialState,
                         action:ActionPayloadType = unknownAction):RrsType {
  return reducer(state, action)
}

(function () {
  setRootContext('default',
    url.parse('http://dev-fpng-jboss-3.etc.uspto.gov:8080/refunds-services/v1/'))

  // setRootContext('default', url.parse('http://ud18174.uspto.gov:8080/refunds-services/v1/'))
})()

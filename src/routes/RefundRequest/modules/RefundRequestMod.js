/* @flow */

import type {ActionPayloadType, RequestErrorReportType} from 'reusable/interfaces/FpngTypes'

import type {
  LookupFormPayloadType,
  PdfLoadingPayloadType,
  LookupFormDataType,
  NamesDataType,
  NamesPayloadType,
  AddressesDataType,
  AddressesPayloadType,
  PaymentHistoryDataType,
  PaymentHistoryDataPayloadType,
  PdfReadPayloadType,
  SaveRefundRequestPayloadType,
  RefundRequestStateObjectType
} from '../interfaces/RefundRequestTypes'

type ShortType = RefundRequestStateObjectType

import {
  get, post, put,
  getRootContext,
  setRootContext,
  responseFail
} from 'reusable/utilities/fluentRequest'
import _debug from 'debug'
import {reset} from 'redux-form'
import url from 'url'
import {upper, lower} from 'reusable/utilities/dataUtils'
import cloneDeep from 'lodash/cloneDeep'

// import dispatchTime from 'promise-time'
import {promiseTime as dispatchTime} from 'reusable/utilities/promisePlugins'

const debug = _debug('refunds:RefundRequestMod:debug')
const debugTime = _debug('refunds:RefundRequestMod:time')

// ------------------------------------
// Constants
// ------------------------------------
export const LOADING_PDF = 'refund/RefundRequest/LOADING_PDF'
export const PDF_BINARY = 'refund/RefundRequest/PDF_BINARY'
export const PDF_LOADED = 'refund/RefundRequest/PDF_LOADED'
export const POST_REFUND_REQUEST = 'refund/RefundRequest/POST_REFUND_REQUEST'
export const LOOKUP_REFERENCED_DATA_START = 'refund/RefundRequest/LOOKUP_REFERENCED_DATA_START'
export const LOOKUP_REFERENCED_DATA_LOADED = 'refund/RefundRequest/LOOKUP_REFERENCED_DATA_LOADED'
export const LOOKUP_REFERENCED_DATA_ERROR = 'refund/RefundRequest/LOOKUP_REFERENCED_DATA_ERROR'
export const LOAD_ADDRESSES_START = 'refund/RefundRequest/LOAD_ADDRESSES_START'
export const LOAD_ADDRESSES_LOADED = 'refund/RefundRequest/LOAD_ADDRESSES_LOADED'
export const LOAD_ADDRESSES_ERROR = 'refund/RefundRequest/LOAD_ADDRESSES_ERROR'
export const LOAD_NAMES_START = 'refund/RefundRequest/LOAD_NAMES_START'
export const LOAD_NAMES_LOADED = 'refund/RefundRequest/LOAD_NAMES_LOADED'
export const LOAD_NAMES_ERROR = 'refund/RefundRequest/LOAD_NAMES_ERROR'
export const LOAD_PAYMENT_HISTORY_DATA_START = 'refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_START'
export const LOAD_PAYMENT_HISTORY_DATA_LOADED = 'refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_LOADED'
export const LOAD_PAYMENT_HISTORY_DATA_ERROR = 'refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_ERROR'
export const RESET_REFUND_REQUEST_FORM_START = 'refund/RefundRequest/RESET_REFUND_REQUEST_FORM_START'
export const RESET_REFUND_REQUEST_FORM_END = 'refund/RefundRequest/RESET_REFUND_REQUEST_FORM_END'
export const CLEAR_ERROR_REPORT = 'refund/RefundRequest/CLEAR_ERROR_REPORT'
export const RESET_STATE = 'refund/RefundRequest/RESET_STATE'
export const SAVED_REFUND_REQUEST = 'refund/RefundRequest/SAVED_REFUND_REQUEST'
export const VALID_LOOKUP_START = 'refund/RefundRequest/VALID_LOOKUP_START'
export const VALID_LOOKUP_END = 'refund/RefundRequest/VALID_LOOKUP_END'
export const VALID_LOOKUP_ERROR = 'refund/RefundRequest/VALID_LOOKUP_ERROR'

// ------------------------------------
// Actions
// ------------------------------------
// https://github.com/wbinnssmith/redux-normalizr-middleware

function loadPaymentHistoryDataStart():ActionPayloadType {
  return {
    type: LOAD_PAYMENT_HISTORY_DATA_START
  }
}

function loadPaymentHistoryDataLoaded(paymentHistoryData:PaymentHistoryDataType):ActionPayloadType {
  return {
    type:    LOAD_PAYMENT_HISTORY_DATA_LOADED,
    payload: paymentHistoryData
  }
}

function loadPaymentHistoryDataError(errorMessage:RequestErrorReportType):ActionPayloadType {
  return {
    type:    LOAD_PAYMENT_HISTORY_DATA_ERROR,
    payload: errorMessage
  }
}

export const loadPaymentHistoryData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm = getState().refundRequest.lookupForm
    const paymentHistoryAPI = url.parse('paymentHistory/' + lookupForm.referenceNum)
    debug('loadPaymentHistoryData: Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(loadPaymentHistoryDataStart())
    return get(paymentHistoryAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(loadPaymentHistoryDataLoaded(jsonData))
      })
      .catch((reason:Error):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to load payment history')
        }
        return dispatch(loadPaymentHistoryDataError(reason.message))
      })
  }
}

function loadNamesDataStart():ActionPayloadType {
  return {
    type: LOAD_NAMES_START
  }
}

function loadNamesDataLoaded(namesData:NamesDataType):ActionPayloadType {
  return {
    type:    LOAD_NAMES_LOADED,
    payload: namesData
  }
}

function loadNamesDataError():ActionPayloadType {
  return {
    type: LOAD_NAMES_ERROR
  }
}

export const loadNamesData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm = getState().refundRequest.lookupForm
    const loadNamesAPI = url.parse('name')
    // const loadNamesAPI = url.parse('patents/' + lookupForm.referenceNum + '/personNames')
    debug('loadNamesData: Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(loadNamesDataStart())

    return get(loadNamesAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(loadNamesDataLoaded(jsonData))
      })
      .catch((reason:any):any => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to load names associated with patent/trademark')
        }
        return dispatch(loadNamesDataError())
      })
  }
}

function loadAddressesDataStart():ActionPayloadType {
  return {
    type: LOAD_ADDRESSES_START
  }
}

function loadAddressesDataLoaded(addressesData:AddressesDataType):ActionPayloadType {
  return {
    type:    LOAD_ADDRESSES_LOADED,
    payload: addressesData
  }
}

function loadAddressesDataError():ActionPayloadType {
  return {
    type: LOAD_ADDRESSES_ERROR
  }
}

export const loadAddressesData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm = getState().refundRequest.lookupForm
    const loadAddressesAPI = url.parse('address')
    // const loadAddressesAPI = url.parse('patents/' + lookupForm.referenceNum + '/addresses')
    debug('loadAddressesData: Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(loadAddressesDataStart())

    return get(loadAddressesAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(loadAddressesDataLoaded(jsonData))
      })
      .catch((reason:any):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to load addresses associated with patent/trademark')
        }
        return dispatch(loadAddressesDataError())
      })
  }
}

export function loadingPdf(pdfFile:Object):ActionPayloadType {
  return {
    type:    LOADING_PDF,
    payload: {
      pdfFile: pdfFile
    }
  }
}

export function pdfBinary(pdfRaw:Uint8Array):ActionPayloadType {
  return {
    type:    PDF_BINARY,
    payload: {
      pdfRaw: pdfRaw
    }
  }
}

export function pdfLoaded():ActionPayloadType {
  return {
    type: PDF_LOADED
  }
}

export function postRefundRequest():ActionPayloadType {
  return {
    type:    POST_REFUND_REQUEST,
    payload: {
      isSaving: true,
      isSaved:  false
    }
  }
}

export function savedRefundRequest():ActionPayloadType {
  return {
    type:    SAVED_REFUND_REQUEST,
    payload: {
      isSaving: false,
      isSaved:  true
    }
  }
}

export function clearErrorReport():ActionPayloadType {
  return {
    type: CLEAR_ERROR_REPORT
  }
}

export function resetState():ActionPayloadType {
  return {
    type: RESET_STATE
  }
}

function resetRefundRequestFormStart():ActionPayloadType {
  return {
    type: RESET_REFUND_REQUEST_FORM_START
  }
}

function resetRefundRequestFormEnd():ActionPayloadType {
  return {
    type: RESET_REFUND_REQUEST_FORM_END
  }
}

function resetRefundRequestForm():Function {
  return (dispatch:Function) => {
    dispatch(resetRefundRequestFormStart())
    // TODO: Hope this isn't async... Check.
    dispatch(reset('resetRefundRequestForm'))
    dispatch(resetRefundRequestFormEnd())
  }
}

export const saveRefundRequest = (/* asciiPDF:string */):Function => {
  return (dispatch:Function):any /* Promise */ => {
    dispatch(postRefundRequest())

    return fetch('/refunds')
      .then((/* data:Object */):any /* Promise */ => dispatch(savedRefundRequest()))
  }
}

function lookupReferencedDataStart():ActionPayloadType {
  return {
    type: LOOKUP_REFERENCED_DATA_START
  }
}

function lookupReferencedDataLoaded():ActionPayloadType {
  return {
    type: LOOKUP_REFERENCED_DATA_LOADED
  }
}

function lookupReferencedDataError():ActionPayloadType {
  return {
      type: LOOKUP_REFERENCED_DATA_ERROR
    }
}

export const lookupReferencedData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    dispatch(lookupReferencedDataStart())
    // Though not presently used, purposely showing the args for a
    // 'resolve' tied to a Promise.spread() to help understand what
    // it does very differently than a Promise.all() and provide a
    // hint if they ever are needed in the future.
    // eslint-disable-next-line no-unused-vars
    const resolve = (paymentHistoryData:?any,
                     namesData:?any,
                     addressesData:?any):any /* Promise */ => {
      if (debugTime.enabled) {
        debugTime('lookupReferencedData time: +' + allDispatches.time + 'ms')
      }
      
      return dispatch(lookupReferencedDataLoaded())
    }

    const allDispatches = ():Promise =>
      // Waaaait a minute... there ain't no spread() in the Promise spec!
      // See promisePlugins.js...
      Promise.spread([
        dispatch(loadPaymentHistoryData()),
        dispatch(loadNamesData()),
        dispatch(loadAddressesData())],
        resolve)
        .catch((reason:any):any /* Promise*/ => {
          if (!getState().refundRequest.isNegativeTesting) {
            responseFail(reason, 'Failed to lookup referenced data')
          }
          return dispatch(lookupReferencedDataError())
        })

    return debugTime.enabled ? dispatchTime(allDispatches)() : allDispatches()
  }
}

function validLookupStart(lookupFormData:LookupFormDataType):ActionPayloadType {
  return {
      type:    VALID_LOOKUP_START,
      payload: lookupFormData
    }
}

function validLookupEnd():ActionPayloadType {
  return {
      type: VALID_LOOKUP_END
    }
}

function validLookupError():ActionPayloadType {
  return {
      type: VALID_LOOKUP_ERROR
    }
}

export function validLookup(lookupFormData:LookupFormDataType):Function {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    dispatch(validLookupStart(lookupFormData))
    dispatch(resetRefundRequestForm())

    return dispatch(lookupReferencedData())
      .then(() => dispatch(validLookupEnd()))
      .catch((reason:any):any /* Promise*/ => {
        if (!getState().refundRequest.isNegativeTesting) {
          responseFail(reason, 'Failed to validate lookup')
        }
        return dispatch(validLookupError())
      })
      .catch(() => dispatch(validLookupError()))
  }
}

export const actions = {
  loadAddressesData,
  loadAddressesDataStart,
  loadAddressesDataLoaded,
  loadAddressesDataError,
  loadingPdf,
  lookupReferencedDataStart,
  lookupReferencedDataLoaded,
  loadNamesData,
  loadNamesDataStart,
  loadNamesDataLoaded,
  loadNamesDataError,
  loadPaymentHistoryData,
  loadPaymentHistoryDataStart,
  loadPaymentHistoryDataLoaded,
  loadPaymentHistoryDataError,
  pdfBinary,
  pdfLoaded,
  lookupReferencedData,
  postRefundRequest,
  saveRefundRequest,
  savedRefundRequest,
  clearErrorReport,
  resetState,
  resetRefundRequestForm,
  resetRefundRequestFormStart,
  resetRefundRequestFormEnd,
  validLookup,
  validLookupStart,
  validLookupEnd,
  validLookupError
}

/*eslint "key-spacing": 0*/
const LOAD_REFUND_REQUEST_ACTION_HANDLERS = {
  [LOAD_ADDRESSES_START]:             (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingAddresses: true,
        address:            {
          ...state.refundRequestForm.address
        }
      }
    })
  },
  [LOAD_ADDRESSES_LOADED]:            (state:ShortType,
                                       action:{payload: AddressesPayloadType}):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingAddresses: false,
        addresses:          action.payload
      }
    })
  },
  [LOAD_ADDRESSES_ERROR]:             (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        address: {
          ...state.refundRequestForm.address,
          isError: true
        }
      }
    })
  },
  [LOAD_NAMES_START]:                 (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingNames: true,
        name:           {
          ...state.refundRequestForm.name
        }
      }
    })
  },
  [LOAD_NAMES_LOADED]:                (state:ShortType,
                                       action:{payload: NamesPayloadType}):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingNames: false,
        names:          action.payload
      }
    })
  },
  [LOAD_NAMES_ERROR]:                 (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        name: {
          ...state.refundRequestForm.name,
          isError: true
        }
      }
    })
  },
  [LOAD_PAYMENT_HISTORY_DATA_START]:  (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingPaymentHistory: true
      }
    })
  },
  [LOAD_PAYMENT_HISTORY_DATA_LOADED]: (state:ShortType,
                                       action:{payload: PaymentHistoryDataPayloadType}):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isLoadingPaymentHistory: false,
        fees:                    action.payload
      }
    })
  },
  [LOAD_PAYMENT_HISTORY_DATA_ERROR]:  (state:ShortType,
                                       action:{payload: RequestErrorReportType}):ShortType => {
    const errorReport = cloneDeep(state.refundRequestForm.errorReport)
    errorReport.push(action.payload)
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isError:     true,
        errorReport: errorReport
      }
    })
  },
  [LOADING_PDF]:                      (state:ShortType,
                                       action:{payload: PdfLoadingPayloadType}):ShortType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        isLoading: true,
        file:      action.payload.pdfFile
      }
    })
  },
  [LOOKUP_REFERENCED_DATA_START]:      (state:ShortType):ShortType => {
    // No affect to state, ... yet.
    return state
  },
  [LOOKUP_REFERENCED_DATA_LOADED]:      (state:ShortType):ShortType => {
    // No affect to state, ... yet.
    return state
  },
  [LOOKUP_REFERENCED_DATA_ERROR]:      (state:ShortType):ShortType => {
    // No affect to state, ... yet.
    return state
  },
  [PDF_BINARY]:                       (state:ShortType,
                                       action:{payload: PdfReadPayloadType}):ShortType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        binaryContent: action.payload.pdfRaw
      }
    })
  },
  [PDF_LOADED]:                       (state:ShortType):ShortType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        isLoading: false
      }
    })
  },
  [POST_REFUND_REQUEST]:              (state:ShortType,
                                       action:{payload: SaveRefundRequestPayloadType}):ShortType => {
    return ({
      ...state,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [RESET_REFUND_REQUEST_FORM_START]:    (state:ShortType):ShortType => {
    return ({
      ...state,
      isResettingRefundForm: true,
      refundRequestForm:     initialState.refundRequestForm
    })
  },
  [RESET_REFUND_REQUEST_FORM_END]:   (state:ShortType):ShortType => {
    return ({
      ...state,
      isResettingRefundForm: false
    })
  },
  [SAVED_REFUND_REQUEST]:             (state:ShortType,
                                       action:{payload: SaveRefundRequestPayloadType}):ShortType => {
    return ({
      ...initialState,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [CLEAR_ERROR_REPORT]:               (state:ShortType):ShortType => {
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isError: false
      },
      refundRequestForm: {
        ...state.refundRequestForm,
        isError:     false,
        errorReport: [],
        address: {
          ...state.refundRequestForm.address,
          isError: false
          // errorReport: []
        },
        name: {
          ...state.refundRequestForm.name,
          isError: false
          // errorReport: []
        }
      }
    })
  },
  [RESET_STATE]:                      ():ShortType => {
    return ({
      ...initialState
    })
  },
  [VALID_LOOKUP_START]:               (state:ShortType,
                                       action:{payload: LookupFormPayloadType}):ShortType => {
    const payload = action.payload
    let referenceNum = payload.referenceNum
    // Stripe any slashes or commas
    referenceNum = referenceNum.replace(/,/g, '')
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
        isLookingUp:  true,
        referenceNum: payload.referenceNum,
        dateFrom:     payload.dateFrom,
        dateTo:       payload.dateTo,
        email:        lower(payload.email)
      }
    })
  },
  [VALID_LOOKUP_END]:               (state:ShortType):ShortType => {
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isLookingUp:  false
      }
    })
  },
  [VALID_LOOKUP_ERROR]:             (state:ShortType):ShortType => {
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isError    : true,
        isLookingUp: false
      }
    })
  }
  
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState:ShortType = {
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
    isError:      false,
    isLookingUp:  false,
    referenceNum: null,
    dateFrom:     null,
    dateTo:       null,
    email:        null
  },
  refundRequestForm:     {
    isError:                 false,
    errorReport:             [],
    fees:                    null,
    depositAccountNum:       null,
    reason:                  null,
    rationale:               null,
    name:                    {
      isError: false,
      found:   false,
      name:    null
    },
    names:                   null,
    address:                 {
      isError: false,
      found:   false,
      role:    null,
      addr0:   null,
      addr1:   null,
      city:    null,
      state:   null,
      zip:     null
    },
    addresses:               null,
    isLoadingPaymentHistory: false,
    isLoadingNames:          false,
    isLoadingAddresses:      false,
    phone:                   null,
    attorneyDocketNum:       null,
    acknowledgement:         false,
    requestDate:             null
  },
  isResettingRefundForm: false,
  isSaving:              false,
  isSaved:               false,
  isNegativeTesting:     false
}

export const unknownAction:ActionPayloadType = {type: "Unknown"}

export default function refundRequestReducer(state:ShortType = initialState,
                                             action:ActionPayloadType = unknownAction):ShortType {
  const handler = LOAD_REFUND_REQUEST_ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

(function() {
  setRootContext('default', url.parse('http://dev-fpng-jboss-3.etc.uspto.gov:8080/refunds-services/v1/'))

  // setRootContext('default', url.parse('http://ud18174.uspto.gov:8080/refunds-services/v1/'))
})()

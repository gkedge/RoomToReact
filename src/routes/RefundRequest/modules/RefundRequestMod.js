/* @flow */

import type {ActionPayloadType} from 'reusable/interfaces/FpngTypes'

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

// https://davidwalsh.name/fetch
import {
  get, post, put,
  getRootContext,
  setRootContext,
  responseFail
} from 'reusable/utilities/fluentRequest'
import {reset} from 'redux-form'
import url, {Url} from 'url'
import {upper, lower} from 'reusable/utilities/dataUtils'
import attempt from 'lodash/attempt'
import isError from 'lodash/isError'
import isObject from 'lodash/isObject'

// ------------------------------------
// Constants
// ------------------------------------
export const LOADING_PDF = 'refund/RefundRequest/LOADING_PDF'
export const PDF_BINARY = 'refund/RefundRequest/PDF_BINARY'
export const PDF_LOADED = 'refund/RefundRequest/PDF_LOADED'
export const POST_REFUND_REQUEST = 'refund/RefundRequest/POST_REFUND_REQUEST'
export const LOOKUP_REFERENCED_DATA_START = 'refund/RefundRequest/LOOKUP_REFERENCED_DATA_START'
export const LOOKUP_REFERENCED_DATA_LOADED = 'refund/RefundRequest/LOOKUP_REFERENCED_DATA_LOADED'
export const LOAD_ADDRESSES_START = 'refund/RefundRequest/LOAD_ADDRESSES_START'
export const LOAD_ADDRESSES_LOADED = 'refund/RefundRequest/LOAD_ADDRESSES_LOADED'
export const LOAD_ADDRESSES_ERROR = 'refund/RefundRequest/LOAD_ADDRESSES_ERROR'
export const LOAD_NAMES_START = 'refund/RefundRequest/LOAD_NAMES_START'
export const LOAD_NAMES_LOADED = 'refund/RefundRequest/LOAD_NAMES_LOADED'
export const LOAD_NAMES_ERROR = 'refund/RefundRequest/LOAD_NAMES_ERROR'
export const LOAD_PAYMENT_HISTORY_DATA_START = 'refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_START'
export const LOAD_PAYMENT_HISTORY_DATA_LOADED = 'refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_LOADED'
export const LOAD_PAYMENT_HISTORY_DATA_ERROR = 'refund/RefundRequest/LOAD_PAYMENT_HISTORY_DATA_ERROR'
export const PRE_RESET_REFUND_REQUEST_FORM = 'refund/RefundRequest/PRE_RESET_REFUND_REQUEST_FORM'
export const POST_RESET_REFUND_REQUEST_FORM = 'refund/RefundRequest/POST_RESET_REFUND_REQUEST_FORM'
export const RESET_STATE = 'refund/RefundRequest/RESET_STATE'
export const SAVED_REFUND_REQUEST = 'refund/RefundRequest/SAVED_REFUND_REQUEST'
export const VALID_LOOKUP = 'refund/RefundRequest/VALID_LOOKUP'

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

function loadPaymentHistoryDataError():ActionPayloadType {
  return {
    type: LOAD_PAYMENT_HISTORY_DATA_ERROR
  }
}

export const loadPaymentHistoryData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm = getState().lookupForm
    const paymentHistoryAPI = url.parse('/paymentHistory/' + lookupForm.referenceNum)
    console.debug('Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(loadPaymentHistoryDataStart())
    return get(paymentHistoryAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(loadPaymentHistoryDataLoaded(jsonData))
      })
      .catch((reason:any):any /* Promise*/ => {
        responseFail(reason, 'Failed to load payment history')
        return dispatch(loadPaymentHistoryDataError())
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
    let lookupForm = getState().lookupForm
    const loadNamesAPI = url.parse('/name/')
    console.debug('Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(loadNamesDataStart())

    return get(loadNamesAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(loadNamesDataLoaded(jsonData))
      })
      .catch((reason:any):any => {
        responseFail(reason, 'Failed to load names')
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
    let lookupForm = getState().lookupForm
    const loadAddressesAPI = url.parse('/address/')
    console.log('Lookup Form: ' + JSON.stringify(lookupForm))
    dispatch(loadAddressesDataStart())

    return get(loadAddressesAPI)
      .setMimeType('json')
      .json()
      .then((jsonData:Object):any /* Promise*/ => {
        // TODO: check schema during development.
        return dispatch(loadAddressesDataLoaded(jsonData))
      })
      .catch((reason:any):any /* Promise*/ => {
        responseFail(reason, 'Failed to load addresses')
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

export function resetState():ActionPayloadType {
  return {
    type: RESET_STATE
  }
}

function resetRefundRequestForm():Function {
  return (dispatch:Function) => {
    dispatch({
      type: PRE_RESET_REFUND_REQUEST_FORM
    })
    dispatch(reset('resetRefundRequestForm'))
    dispatch({
      type: POST_RESET_REFUND_REQUEST_FORM
    })
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

export const lookupReferencedData = ():Function => {
  return (dispatch:Function):any /* Promise */ => {
    dispatch(lookupReferencedDataStart())

    return Promise.all([
      dispatch(loadPaymentHistoryData()),
      dispatch(loadNamesData()),
      dispatch(loadAddressesData())
    ])
      .then(():any /* Promise*/ => dispatch(lookupReferencedDataLoaded()))
  }
}

export function validLookup(lookupFormData:LookupFormDataType):Function {
  return (dispatch:Function):any /* Promise */ => {
    dispatch({
      type:    VALID_LOOKUP,
      payload: lookupFormData
    })
    dispatch(resetRefundRequestForm())

    return dispatch(lookupReferencedData())
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
  resetState,
  resetRefundRequestForm,
  validLookup
}

/*eslint "key-spacing": 0*/
const LOAD_REFUND_REQUEST_ACTION_HANDLERS = {
  [LOAD_ADDRESSES_START]:             (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isError:            false,
        isLoadingAddresses: true,
        address: {
          ...state.refundRequestForm.address,
          isError: false
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
        isError:        false,
        isLoadingNames: true,
        name: {
          ...state.refundRequestForm.name,
          isError: false
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
        isError:                 false,
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
  [LOAD_PAYMENT_HISTORY_DATA_ERROR]:  (state:ShortType):ShortType => {
    return ({
      ...state,
      refundRequestForm: {
        ...state.refundRequestForm,
        isError: true
      }
    })
  },
  [LOADING_PDF]:                      (state:ShortType,
                                       action:{payload: PdfLoadingPayloadType}):ShortType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        isError:   false,
        isLoading: true,
        file:      action.payload.pdfFile
      }
    })
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
  [PRE_RESET_REFUND_REQUEST_FORM]:    (state:ShortType):ShortType => {
    return ({
      ...state,
      isResettingRefundForm: true,
      refundRequestForm:     initialState.refundRequestForm
    })
  },
  [POST_RESET_REFUND_REQUEST_FORM]:   (state:ShortType):ShortType => {
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
  [RESET_STATE]:                      ():ShortType => {
    return ({
      ...initialState
    })
  },
  [VALID_LOOKUP]:                     (state:ShortType,
                                       action:{payload: LookupFormPayloadType}):ShortType => {
    // TODO: normalize API not published yet in redux-form@6.0.0-alpha-15 so
    // Notice 'case' normalizing here!  Once normalize API is published
    // I am hoping that the lower()/upper() can be removed here.
    // See redux-form filed definitions in LookupForm renderer.
    return ({
      ...state,
      lookupForm: {
        ...state.lookupForm,
        isLookingUp:  false,
        referenceNum: upper(action.payload.referenceNum),
        dateFrom:     action.payload.dateFrom,
        dateTo:       action.payload.dateTo,
        email:        lower(action.payload.email)
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
  isSaved:               false
}

export const unknownAction:ActionPayloadType = {type: "Unknown"}

export default function refundRequestReducer(state:ShortType = initialState,
                                             action:ActionPayloadType = unknownAction):ShortType {
  const handler = LOAD_REFUND_REQUEST_ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

(function() {
  setRootContext('default', url.parse('http://dev-fpng-jboss-3.etc.uspto.gov:8080/refunds-services/v1'))
})()


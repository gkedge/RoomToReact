/* @flow */

// TODO: might be able to remove some the serious amoutn of boiler plate going
// on in here with: https://github.com/acdlite/redux-actions

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
import cloneDeep from 'lodash/cloneDeep'

import {upper, lower} from 'reusable/utilities/dataUtils'
import {createReducer, unknownAction} from 'reusable/utilities/reduxStoreUtils'

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

export const loadPaymentHistoryDataStart = ():ActionPayloadType => {
  return {
    type: LOAD_PAYMENT_HISTORY_DATA_START
  }
}

export const loadPaymentHistoryDataLoaded =
               (paymentHistoryData:PaymentHistoryDataType):ActionPayloadType => {
                 return {
                   type:    LOAD_PAYMENT_HISTORY_DATA_LOADED,
                   payload: paymentHistoryData
                 }
               }

export const loadPaymentHistoryDataError =
               (errorMessage:RequestErrorReportType):ActionPayloadType => {
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

export const loadNamesDataStart = ():ActionPayloadType => {
  return {
    type: LOAD_NAMES_START
  }
}

export const loadNamesDataLoaded = (namesData:NamesDataType):ActionPayloadType => {
  return {
    type:    LOAD_NAMES_LOADED,
    payload: namesData
  }
}

export const loadNamesDataError = ():ActionPayloadType => {
  return {
    type: LOAD_NAMES_ERROR
  }
}

export const loadNamesData = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm = getState().refundRequest.lookupForm
    const loadNamesAPI = url.parse('patents/' +
                                   lookupForm.referenceNum +
                                   '/personNames')
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

export const loadAddressesDataStart = ():ActionPayloadType => {
  return {
    type: LOAD_ADDRESSES_START
  }
}

export const loadAddressesDataLoaded = (addressesData:AddressesDataType):ActionPayloadType => {
  return {
    type:    LOAD_ADDRESSES_LOADED,
    payload: addressesData
  }
}

export const loadAddressesDataError = ():ActionPayloadType => {
  return {
    type: LOAD_ADDRESSES_ERROR
  }
}

export const loadAddressesData:Function  = ():Function => {
  return (dispatch:Function, getState:Function):any /* Promise */ => {
    let lookupForm = getState().refundRequest.lookupForm
    const loadAddressesAPI = url.parse('patents/' +
                                       lookupForm.referenceNum +
                                       '/addresses')
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
    type:    POST_REFUND_REQUEST,
    payload: {
      isSaving: true,
      isSaved:  false
    }
  }
}

export const savedRefundRequest = ():ActionPayloadType => {
  return {
    type:    SAVED_REFUND_REQUEST,
    payload: {
      isSaving: false,
      isSaved:  true
    }
  }
}

export const clearErrorReport = ():ActionPayloadType => {
  return {
    type: CLEAR_ERROR_REPORT
  }
}

export const resetState = ():ActionPayloadType => {
  return {
    type: RESET_STATE
  }
}

export const resetRefundRequestFormStart = ():ActionPayloadType => {
  return {
    type: RESET_REFUND_REQUEST_FORM_START
  }
}

export const resetRefundRequestFormEnd = ():ActionPayloadType => {
  return {
    type: RESET_REFUND_REQUEST_FORM_END
  }
}

export const resetRefundRequestForm = ():Function => {
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

export const lookupReferencedDataStart = ():ActionPayloadType => {
  return {
    type: LOOKUP_REFERENCED_DATA_START
  }
}

export const lookupReferencedDataLoaded = ():ActionPayloadType => {
  return {
    type: LOOKUP_REFERENCED_DATA_LOADED
  }
}

export const lookupReferencedDataError = ():ActionPayloadType => {
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
    const resolve = (paymentHistoryData:?any, namesData:?any, addressesData:?any):any /* Promise */ => {
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

export const validLookupStart = (lookupFormData:LookupFormDataType):ActionPayloadType => {
  return {
    type:    VALID_LOOKUP_START,
    payload: lookupFormData
  }
}

export const validLookupEnd = ():ActionPayloadType => {
  return {
    type: VALID_LOOKUP_END
  }
}

export const validLookupError = ():ActionPayloadType => {
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
    address: {
      isError              : false,
      found                : false,
      version              : 0,
      streetLineOne        : null,
      streetLineTwo        : null,
      cityName             : null,
      geographicRegionModel: {
        geographicRegionCategory: null,
        geographicRegionText    : null,
        geographicRegionName    : null
      },
      countryCode          : null,
      countryName          : null,
      postalCode           : null,
      type                 : null
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

const reducer = createReducer(initialState, LOAD_REFUND_REQUEST_ACTION_HANDLERS)
export default function refundRequestReducer(state:ShortType = initialState,
                                             action:ActionPayloadType = unknownAction):ShortType {
  return reducer(state, action)
}

(function() {
  setRootContext('default', url.parse('http://dev-fpng-jboss-3.etc.uspto.gov:8080/refunds-services/v1/'))

  // setRootContext('default', url.parse('http://ud18174.uspto.gov:8080/refunds-services/v1/'))
})()

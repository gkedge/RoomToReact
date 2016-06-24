/* @flow */

import type {ActionPayloadType} from 'reusable/interfaces/FpngTypes'

import type {
  LookupFormPayloadType,
  PdfLoadingPayloadType,
  LookupFormDataType,
  PdfReadPayloadType,
  SaveRefundRequestPayloadType,
  LoadRefundRequestStateObjectType
} from '../interfaces/LoadRefundRequestTypes'

// https://davidwalsh.name/fetch
import 'whatwg-fetch'  // isomorphic-fetch contains the browser-specific whatwg-fetch
import {Url} from 'url'
import {upper, lower} from 'reusable/utilities/dataUtils'

// ------------------------------------
// Constants
// ------------------------------------
export const VALID_LOOKUP = 'VALID_LOOKUP'
export const LOADING_PDF = 'LOADING_PDF'
export const PDF_BINARY = 'PDF_BINARY'
export const PDF_LOADED = 'PDF_LOADED'
export const POST_REFUND_REQUEST = 'POST_REFUND_REQUEST'
export const SAVED_REFUND_REQUEST = 'SAVED_REFUND_REQUEST'
export const RESET_STATE = 'RESET_STATE'

// ------------------------------------
// Actions
// ------------------------------------
export function validLookup(lookupFormData:LookupFormDataType):ActionPayloadType {
  return {
    type:    VALID_LOOKUP,
    payload: {
      lookup: lookupFormData
    }
  }
}

export function loadingPdf(pdfFile:Object):ActionPayloadType {
  return {
    type:    LOADING_PDF,
    payload: {
      isLoading: true,
      pdfFile:   pdfFile
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
    type:    PDF_LOADED,
    payload: {
      isLoading: false
    }
  }
}

export function postLoadRefundRequest():ActionPayloadType {
  return {
    type:    POST_REFUND_REQUEST,
    payload: {
      isSaving: true,
      isSaved:  false
    }
  }
}

export function savedLoadRefundRequest():ActionPayloadType {
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

// https://www.npmjs.com/package/redux-api 42/332/1770
// https://www.npmjs.com/package/redux-fetch-api 0/16/119
// https://www.npmjs.com/package/redux-rest-resource 81/107/181  <----
// https://github.com/wbinnssmith/redux-normalizr-middleware
export const fetchPaymentHistory = (filePath:Url, lookupFormData:LookupFormDataType):Function => {
  return (dispatch:Function):any /* Promise */ => {
    // let state = getState();
    // console.out('State: ' + JSON.stringify(state));
    // dispatch(requestLoadRefundRequest(pdfFilePath))

    return fetch(filePath.format(), {
      // credentials: 'same-origin',
      // method: 'post',
      // headers: {
      //  'Accept': 'application/json',
      //  'Content-Type': 'application/json'
      // },
      // body: JSON.stringify(Object.assign({}, lookupFormData, {status: 'publish'}))
    })
      .then((data:Object):any /* Promise*/ => data.text())
      .then((text:string):any /* Promise*/ => dispatch(pdfBinary(new Uint8Array([10], [11]))))
  }
}

export const saveRefundRequest = (/* asciiPDF:string */):Function => {
  return (dispatch:Function):any /* Promise */ => {
    dispatch(postLoadRefundRequest())

    return fetch('/refunds')
      .then((/* data:Object */):any /* Promise */ => dispatch(savedLoadRefundRequest()))
  }
}

export const actions = {
  loadingPdf,
  pdfBinary,
  pdfLoaded,
  fetchPaymentHistory,
  postLoadRefundRequest,
  saveRefundRequest,
  savedLoadRefundRequest,
  resetState
}

/*eslint "key-spacing": 0*/
const LOAD_REFUND_REQUEST_ACTION_HANDLERS = {
  [VALID_LOOKUP]: (state:LoadRefundRequestStateObjectType,
                   action:{payload: LookupFormPayloadType}):LoadRefundRequestStateObjectType => {
    // TODO: normalize API not published yet in redux-form@6.0.0-alpha-15 so
    // I am 'case' normalizing here.  Once normalize API is published
    // I am hoping that the lower/upper functions can be removed here.
    return ({
      ...state,
      lookup: {
        referenceNum: upper(action.payload.lookup.referenceNum),
        dateFrom:     action.payload.lookup.dateFrom,
        dateTo:       action.payload.lookup.dateTo,
        email:        lower(action.payload.lookup.email)
      }
    })
  },
  [LOADING_PDF]:          (state:LoadRefundRequestStateObjectType,
                           action:{payload: PdfLoadingPayloadType}):LoadRefundRequestStateObjectType => {
    return ({
      ...state,
      isLoading: action.payload.isLoading,
      pdf:       {
        ...state.pdf,
        file: action.payload.pdfFile
      }
    })
  },
  [PDF_BINARY]:           (state:LoadRefundRequestStateObjectType,
                           action:{payload: PdfReadPayloadType}):LoadRefundRequestStateObjectType => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        binaryContent: action.payload.pdfRaw
      }
    })
  },
  [PDF_LOADED]:           (state:LoadRefundRequestStateObjectType,
                           action:{payload: PdfLoadingPayloadType}):LoadRefundRequestStateObjectType => {
    return ({
      ...state,
      isLoading: action.payload.isLoading
    })
  },
  [POST_REFUND_REQUEST]:  (state:LoadRefundRequestStateObjectType,
                           action:{payload: SaveRefundRequestPayloadType}):LoadRefundRequestStateObjectType => {
    return ({
      ...initialState,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [SAVED_REFUND_REQUEST]: (state:LoadRefundRequestStateObjectType,
                           action:{payload: SaveRefundRequestPayloadType}):LoadRefundRequestStateObjectType => {
    return ({
      ...state,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [RESET_STATE]:          ():LoadRefundRequestStateObjectType => {
    return ({
      ...initialState
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState:LoadRefundRequestStateObjectType = {
  pdf:       {
    isLoading:     false,
    file:          null,
    content:       null,
    binaryContent: null,
    page:          0,
    scale:         0
  },
  lookup:    {
    referenceNum: null,
    dateFrom:     null,
    dateTo:       null,
    email:        null
  },
  isLoading: false,
  isSaving:  false,
  isSaved:   false
}

export const unknownAction:ActionPayloadType = {type: "Unknown"}

type ShorterType = LoadRefundRequestStateObjectType;

export default function loadRefundRequestReducer(state:ShorterType = initialState,
                                                 action:ActionPayloadType = unknownAction):ShorterType {
  const handler = LOAD_REFUND_REQUEST_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

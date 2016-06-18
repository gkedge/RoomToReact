/* @flow */

import type {
  PdfLoadingPayload,
  ActionPayload,
  LookupFormData,
  PdfReadPayload,
  SaveRefundRequestPayload,
  LoadRefundRequestStateObject
} from '../interfaces/LoadRefundRequestTypes'
// https://davidwalsh.name/fetch
import 'whatwg-fetch'  // isomorphic-fetch contains the browser-specific whatwg-fetch
import {Url} from 'url'

import {reducer as formReducer} from 'redux-form'

// ------------------------------------
// Constants
// ------------------------------------
export const LOADING_PDF = 'LOADING_PDF'
export const PDF_BINARY = 'PDF_BINARY'
export const PDF_LOADED = 'PDF_LOADED'
export const POST_REFUND_REQUEST = 'POST_REFUND_REQUEST'
export const SAVED_REFUND_REQUEST = 'SAVED_REFUND_REQUEST'
export const RESET_STATE = 'RESET_STATE'

// ------------------------------------
// Actions
// ------------------------------------
export function loadingPdf(pdfFile:Object):ActionPayload {
  return {
    type:    LOADING_PDF,
    payload: {
      isLoading: true,
      pdfFile:   pdfFile
    }
  }
}

export function pdfBinary(pdfRaw:Uint8Array):ActionPayload {
  return {
    type:    PDF_BINARY,
    payload: {
      pdfRaw: pdfRaw
    }
  }
}

export function pdfLoaded():ActionPayload {
  return {
    type:    PDF_LOADED,
    payload: {
      isLoading: false
    }
  }
}

export function postLoadRefundRequest():ActionPayload {
  return {
    type:    POST_REFUND_REQUEST,
    payload: {
      isSaving: true,
      isSaved:  false
    }
  }
}

export function savedLoadRefundRequest():ActionPayload {
  return {
    type:    SAVED_REFUND_REQUEST,
    payload: {
      isSaving: false,
      isSaved:  true
    }
  }
}

export function resetState():ActionPayload {
  return {
    type: RESET_STATE
  }
}

export const fetchPaymentHistory = (filePath, lookupFormData:LookupFormData):Function => {
  // return (dispatch:Function):Promise => {
  return (dispatch:Function, getState) => {
    // let state = getState();
    // console.out('State: ' + JSON.stringify(state));
    // dispatch(requestLoadRefundRequest(pdfFilePath))

    return fetch(filePath.format())
      .then(data => data.text())
      .then(text => dispatch(pdfBinary(new Uint8Array([10], [11]))))
  }
}

export const saveRefundRequest = (asciiPDF:string):Function => {
  // return (dispatch:Function):Promise => {
  return (dispatch:Function) => {
    dispatch(postLoadRefundRequest())

    return fetch('/refunds')
      .then(data => dispatch(savedLoadRefundRequest()))
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
  [LOADING_PDF]:          (state:LoadRefundRequestStateObject,
                           action:{payload: PdfLoadingPayload}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isLoading: action.payload.isLoading,
      pdf:       {
        ...state.pdf,
        file: action.payload.pdfFile
      }
    })
  },
  [PDF_BINARY]:           (state:LoadRefundRequestStateObject,
                           action:{payload: PdfReadPayload}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      pdf: {
        ...state.pdf,
        binaryContent: action.payload.pdfRaw
      }
    })
  },
  [PDF_LOADED]:           (state:LoadRefundRequestStateObject,
                           action:{payload: PdfLoadingPayload}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isLoading: action.payload.isLoading
    })
  },
  [POST_REFUND_REQUEST]:  (state:LoadRefundRequestStateObject,
                           action:{payload: SaveRefundRequestPayload}):LoadRefundRequestStateObject => {
    return ({
      ...initialState,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [SAVED_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                           action:{payload: SaveRefundRequestPayload}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [RESET_STATE]:          (state:LoadRefundRequestStateObject):LoadRefundRequestStateObject => {
    return ({
      ...initialState
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState:LoadRefundRequestStateObject = {
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

export const unknownAction:ActionPayload = {type: "Unknown"}

export default function loadRefundRequestReducer(state:LoadRefundRequestStateObject = initialState,
                                                 action:ActionPayload = unknownAction):LoadRefundRequestStateObject {
  const handler = LOAD_REFUND_REQUEST_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

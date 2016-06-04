/* @flow */

import type {
  LoadRefundRequestObject,
  SaveRefundRequestObject,
  LoadRefundRequestStateObject
} from '../interfaces/loadRefundRequest.js'
// https://davidwalsh.name/fetch
import 'whatwg-fetch'  // isomorphic-fetch contains the browser-specific whatwg-fetch
import {Url} from 'url'

import {reducer as formReducer} from 'redux-form'

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_LOAD_REFUND_REQUEST = 'RECEIVE_LOAD_REFUND_REQUEST'
export const REQUEST_LOAD_REFUND_REQUEST = 'REQUEST_LOAD_REFUND_REQUEST'
export const POST_REFUND_REQUEST = 'POST_REFUND_REQUEST'
export const SAVED_REFUND_REQUEST = 'SAVED_REFUND_REQUEST'

// ------------------------------------
// Actions
// ------------------------------------
export function requestLoadRefundRequest():any {
  return {
    type:    REQUEST_LOAD_REFUND_REQUEST,
    payload: {
      isLoading:  true,
      pdfContent: null
    }
  }
}

export function receiveLoadRefundRequest(asciiPDF:string):any {
  return {
    type:    RECEIVE_LOAD_REFUND_REQUEST,
    payload: {
      isLoading:  false,
      pdfContent: asciiPDF
    }
  }
}

export function postLoadRefundRequest():any {
  return {
    type:    POST_REFUND_REQUEST,
    payload: {
      isSaving: true,
      isSaved:  false
    }
  }
}

export function savedLoadRefundRequest():any {
  return {
    type:    SAVED_REFUND_REQUEST,
    payload: {
      isSaving: false,
      isSaved:  true
    }
  }
}

export const fetchRefundRequestFile = (file:Url):Function => {
  // return (dispatch:Function):Promise => {
  return (dispatch:Function) => {
    dispatch(requestLoadRefundRequest())

    return fetch(file.format())
      .then(data => data.text())
      .then(text => dispatch(receiveLoadRefundRequest(text || '')))
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
  requestLoadRefundRequest,
  fetchRefundRequestFile,
  receiveLoadRefundRequest,
  postLoadRefundRequest,
  saveRefundRequest,
  savedLoadRefundRequest
}

/*eslint "key-spacing": 0*/
const LOAD_REFUND_REQUEST_ACTION_HANDLERS = {
  [REQUEST_LOAD_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                                  action:{payload: LoadRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isLoading:  action.payload.isLoading,
      pdfContent: action.payload.pdfContent
    })
  },
  [RECEIVE_LOAD_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                                  action:{payload: LoadRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isLoading:  action.payload.isLoading,
      pdfContent: action.payload.pdfContent
    })
  },
  [POST_REFUND_REQUEST]:         (state:LoadRefundRequestStateObject,
                                  action:{payload: SaveRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isSaving: action.payload.isSaving,
      isSaved:  action.payload.isSaved
    })
  },
  [SAVED_REFUND_REQUEST]:        (state:LoadRefundRequestStateObject,
                                  action:{payload: SaveRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isSaving:   action.payload.isSaving,
      isSaved:    action.payload.isSaved,
      pdfContent: null
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState:LoadRefundRequestStateObject = {
  referenceNum: -1,
  dateFrom:     null,
  dateTo:       null,
  isLoading:    false,
  pdfContent:   null,
  isSaving:     false,
  isSaved:      false
}

export default function loadRefundRequestReducer(state:LoadRefundRequestStateObject = initialState,
                                                 action:any):LoadRefundRequestStateObject {
  const handler = LOAD_REFUND_REQUEST_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
/* @flow */
// https://davidwalsh.name/fetch

import fetch from 'isomorphic-fetch'
import type {LoadRefundRequestObject, LoadRefundRequestStateObject} from '../interfaces/loadRefundRequest.js'
import Url from 'url'

import {reducer as formReducer} from 'redux-form'

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVE_LOAD_REFUND_REQUEST = 'RECEIVE_LOAD_REFUND_REQUEST'
export const REQUEST_LOAD_REFUND_REQUEST = 'REQUEST_LOAD_REFUND_REQUEST'
export const POST_CURRENT_LOAD_REFUND_REQUEST = 'POST_CURRENT_LOAD_REFUND_REQUEST'
export const SAVED_CURRENT_LOAD_REFUND_REQUEST = 'SAVED_CURRENT_LOAD_REFUND_REQUEST'

// ------------------------------------
// Actions
// ------------------------------------
export function requestLoadRefundRequest():any {
  return {
    type: REQUEST_LOAD_REFUND_REQUEST,
    payload: {
      isLoading: true
    }
  }
}

export function receiveLoadRefundRequest(value:string):any {
  return {
    type: RECEIVE_LOAD_REFUND_REQUEST,
    payload: {
      isLoading: false,
      pdfContent: value
    }
  }
}

export function postCurrentLoadRefundRequest():any {
  return {
    type: POST_CURRENT_LOAD_REFUND_REQUEST,
    payload: {
      isSaving: true
    }
  }
}

export function savedCurrentLoadRefundRequest():any {
  return {
    type: SAVED_CURRENT_LOAD_REFUND_REQUEST,
    payload: {
      isSaving: false,
      isSaved: true
    }
  }
}

export const fetchRefundRequestFile = (file:Url):Function => {
  return (dispatch:Function):Promise => {
    dispatch(requestLoadRefundRequest())

    return fetch(file.format())
      .then(data => data.text())
      .then(text => dispatch(receiveLoadRefundRequest(text)))
  }
}

export const saveRefundRequestFile = ():Function => {
  return (dispatch:Function):Promise => {
    dispatch(requestLoadRefundRequest())

    return fetch('/refunds')
      .then(data => data.text())
      .then(text => dispatch(receiveLoadRefundRequest(text)))
  }
}

export const actions = {
  requestLoadRefundRequest,
  fetchRefundRequestFile,
  postCurrentLoadRefundRequest,
  savedCurrentLoadRefundRequest
}

const LOAD_REFUND_REQUEST_ACTION_HANDLERS = {
  [REQUEST_LOAD_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                                  action:{payload: LoadRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isLoading: action.payload.isLoading
    })
  },
  [RECEIVE_LOAD_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                                  action:{payload: LoadRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      pdfContent: action.payload.pdfContent,
      isLoading: action.payload.isLoading
    })
  },
  [POST_CURRENT_LOAD_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                                       action:{payload: LoadRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isSaving: action.payload.isSaving
    })
  },
  [SAVED_CURRENT_LOAD_REFUND_REQUEST]: (state:LoadRefundRequestStateObject,
                                        action:{payload: LoadRefundRequestObject}):LoadRefundRequestStateObject => {
    return ({
      ...state,
      isSaving: action.payload.isSaving,
      isSaved: action.payload.isSaved
    })
  }
}

// ------------------------------------
// Reducer
// ------------------------------------

export const initialState:LoadRefundRequestStateObject = {
  referenceNum: -1,
  dateFrom: null, 
  dateTo: null,
  isLoading: false, pdfContent: null,
  isSaving: false, isSaved: false
}

export default function loadRefundRequestReducer(state:LoadRefundRequestStateObject = initialState,
                                                 action:any):LoadRefundRequestStateObject {
  const handler = LOAD_REFUND_REQUEST_ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}

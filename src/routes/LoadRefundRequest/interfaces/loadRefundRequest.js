/* @flow */

export type LoadRefundRequestObject = {
  isLoading: boolean,
  pdfContent: ?string
}

export type SaveRefundRequestObject = {
  isSaving: boolean,
  isSaved: boolean
}

export type LoadRefundRequestStateObject = {
  referenceNum: number,
  dateFrom: ?Date,
  dateTo: ?Date,
  isLoading: boolean,
  pdfContent: ?string, // base64
  isSaving: boolean,
  isSaved: boolean
}

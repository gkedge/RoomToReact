/* @flow */

// import PdfObject from 'components/Pdf/interfaces/PdfTypes.js'

export type PdfObject = {
  isLoading: boolean,
  file: ?string,
  content: ?string,
  page: ?number,
  scale: ?number,
  onDocumentComplete : Function,
  onPageComplete: Function
}

export type LoadRefundRequestObject = {
  pdf: ?PdfObject,
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


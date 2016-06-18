/* @flow */

export type PdfState = {
  isLoading: boolean,
  file: any,
  content: ?string, // binary
  binaryContent: ?Uint8Array, // binary
  page: ?number,
  scale: ?number
}

export type LookupState = {
  referenceNum: ?string,
  dateFrom: ?string,
  dateTo: ?string,
  email: ?string
}

export type ActionPayload = {
  type: string,
  meta: ?Object,
  payload: ?any
}

export type PdfData = {
  pdf: ?PdfState
}

export type LookupFormData = {
  lookup: ?LookupState
}

export type PdfLoadingPayload = {
  isLoading: boolean,
  pdfFile: ?Object
}

export type PdfReadPayload = {
  pdfRaw: Uint8Array
}

export type SaveRefundRequestPayload = {
  isSaving: boolean,
  isSaved: boolean
}

export type LoadRefundRequestStateObject = {
  pdf: PdfState,
  lookup: LookupState,
  isLoading: boolean,
  isSaving: boolean,
  isSaved: boolean
}

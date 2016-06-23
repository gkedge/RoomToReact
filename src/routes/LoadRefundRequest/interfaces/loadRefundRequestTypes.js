/* @flow */

export type PdfStateType = {
  isLoading: boolean,
  file: any,
  content: ?string, // binary
  binaryContent: ?Uint8Array, // binary
  page: ?number,
  scale: ?number
}

export type LookupStateType = {
  referenceNum: ?string,
  dateFrom: ?string,
  dateTo: ?string,
  email: ?string
}

export type PdfDataType = {
  pdf: ?PdfStateType
}

export type LookupFormDataType = LookupStateType

export type PdfLoadingPayloadType = {
  isLoading: boolean,
  pdfFile: ?Object
}

export type LookupFormPayloadType = {
  lookup: LookupFormDataType
}

export type PdfReadPayloadType = {
  pdfRaw: Uint8Array
}

export type SaveRefundRequestPayloadType = {
  isSaving: boolean,
  isSaved: boolean
}

export type LoadRefundRequestStateObjectType = {
  pdf: PdfStateType,
  lookup: LookupStateType,
  isLoading: boolean,
  isSaving: boolean,
  isSaved: boolean
}

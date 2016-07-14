/* @flow */

import type {ActionPayloadType, RequestErrorReportType} from 'reusable/interfaces/FpngTypes'

export type PdfStateType = {
  isError: boolean,
  isLoading: boolean,
  file: any,
  content: ?string, // binary
  binaryContent: ?Uint8Array, // binary
  page: ?number,
  scale: ?number
}

export type LookupStateType = {
  isError: ?boolean,
  isLookingUp: ?boolean,
  referenceNum: ?string,
  dateFrom: ?string,
  dateTo: ?string,
  email: ?string
}

export type PdfDataType = {
  pdf: ?PdfStateType
}

export type LookupFormDataType = LookupStateType

export type NamesDatumType = {
  firstName: ?string,
  lastName: string
}

export type NamesDataType = Array<NamesDatumType>

export type NamesPayloadType = NamesDataType

export type AddressesDatumType = {
  addr0: ?string,
  addr1: ?string,
  city: ?string,
  state: ?string,
  zip: ?string
}

export type AddressesDataType = Array<AddressesDatumType>

export type AddressesPayloadType = AddressesDataType

type RefundRequestNameStateType = {
  isError: boolean,
  found: boolean,
  name: ?NamesType
}

type RefundRequestAddressStateType = {
  isError: boolean,
  found: boolean,
  role: ?string,
  addr0: ?string,
  addr1: ?string,
  city: ?string,
  state: ?string,
  zip: ?string
}

export type RefundRequestStateType = {
  // I don't understand why each of these entries MUST be optional
  // to get through a type check when creating a RefundRequest. Ugh!
  isError: ?boolean,
  errorReport: ?Array<RequestErrorReportType>,
  fees: ?PaymentHistoryStateType,
  depositAccountNum: ?number,
  reason: ?string,
  rationale: ?string,
  name: ?RefundRequestNameStateType,
  names: ?NamesDataType,
  address: ?RefundRequestAddressStateType,
  addresses: ?AddressesDataType,
  phone: ?number,
  isLoadingPaymentHistory: ?boolean,
  isLoadingNames: ?boolean,
  isLoadingAddresses: ?boolean,
  attorneyDocketNum: ?number,
  acknowledgement: ?boolean,
  requestDate: ?string
}

export type RefundRequestFormDataType = RefundRequestStateType

export type RefundRequestStateObjectType = {
  pdf: PdfStateType,
  lookupForm: LookupStateType,
  refundRequestForm: RefundRequestStateType,
  isResettingRefundForm: boolean,
  isSaving: boolean,
  isSaved: boolean,
  isNegativeTesting: boolean
}

/* Action Payload Types */
export type PdfLoadingPayloadType = {
  pdfFile: ?Object
}

export type LookupFormPayloadType = LookupFormDataType

/* Payment History Types */
export type PaymentHistoryItemType = {
  "postingReferenceText": string,
  "datePosted": string,
  "feeCode": string,
  "feeCodeDescription": string,
  "feeAmount": ?number,
  "quantity": ?number,
  "amount": ?number,
  "mailRoomDate": string,
  "paymentMethodType": string
}
export type PaymentHistoryModelType = {
  version: number,
  items: Array<PaymentHistoryItemType>
}
export type PaymentHistoryDatumType = {
  success: boolean,
  errorCode: number,
  errorMessageText: Array<string>,
  infoMessageText: Array<string>,
  warnMessageText: Array<string>,
  model: ?Array<PaymentHistoryModelType>
}
export type PaymentHistoryDataType = PaymentHistoryDatumType
export type PaymentHistoryStateType = PaymentHistoryDataType
export type PaymentHistoryDataPayloadType = PaymentHistoryDataType

export type PdfReadPayloadType = {
  pdfRaw: Uint8Array
}

export type SaveRefundRequestPayloadType = {
  isSaving: boolean,
  isSaved: boolean
}

export type SaveRefundRequestDataType = SaveRefundRequestPayloadType

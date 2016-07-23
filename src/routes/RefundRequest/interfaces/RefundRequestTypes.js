/* @flow */

import type {ActionPayloadType, RequestIssueReportType} from 'reusable/interfaces/FpngTypes'

type PdfStateType = {
  isError: boolean,
  isLoading: boolean,
  file: any,
  content: ?string, // binary
  binaryContent: ?Uint8Array, // binary
  page: ?number,
  scale: ?number
}

export type PdfDataType = {
  pdf: ?PdfStateType
}

export type LookupDataType = {
  isIssue: boolean,
  isLookingUp: ?boolean,
  referenceNum: ?string,
  dateFrom: ?string,
  dateTo: ?string,
  email: ?string
}

type LookupStateType = LookupDataType

export type LookupFormDataType = {
  lookupForm: LookupDataType
}

export type LookupPayloadType = LookupDataType

export type NamesDatumType = {
  version: number,
  prefixName: string,
  firstName: string,
  lastName: string,
  middleName: string,
  suffixName: string,
  role: string
}

type RefundRequestNamesStateType = {
  isIssue: boolean,
  data: ?Array<NamesDatumType>
}

type RefundRequestNameStateType = {
  found: boolean,
  name: ?NamesDatumType
}

export type NamesDataType = Array<NamesDatumType>
export type NamesPayloadType = NamesDataType

export type GeographicRegionModelType = {
  "geographicRegionCategory": ?string,
  "geographicRegionText" : ?string,
  "geographicRegionName" : ?string
}

export type AddressesDatumType = {
  version : number,
  streetLineOne : ?string,
  streetLineTwo : ?string,
  cityName : ?string,
  geographicRegionModel: GeographicRegionModelType,
  countryCode : ?string,
  countryName : ?string,
  postalCode : ?string,
  type : ?string
}

type RefundRequestAddressesStateType = {
  isIssue: boolean,
  data: ?Array<AddressesDatumType>
}

type RefundRequestAddressStateType = {
  found: boolean,
  address: ?AddressesDatumType
}

export type AddressesDataType = Array<AddressesDatumType>
export type AddressesPayloadType = AddressesDataType

/* Action Payload Types */
export type PdfLoadingPayloadType = {
  pdfFile: ?Object
}

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
export type PaymentHistoryModelType = [ {
  version: number,
  items: Array<PaymentHistoryItemType>
}]

export type PaymentHistoryDataType = PaymentHistoryModelType
export type PaymentHistoryDataPayloadType = PaymentHistoryDataType

export type FeesStateType = {
  isIssue: boolean,
  data: ?Array<PaymentHistoryItemType>
}

export type PdfReadPayloadType = {
  pdfRaw: Uint8Array
}

export type MiscDataType = {
  misc: {
    isIssue: boolean,
    isResettingRefundForm: boolean,
    isNegativeTesting: boolean,
    issueReport: Array<RequestIssueReportType>
  }
}

export type SaveRequestStateType = {
  isSaving: boolean,
  isSaved: boolean,
  isIssue: boolean
}

export type RefundRequestFormStateType = {
  // I don't understand why each of these entries MUST be optional
  // to get through a type check when creating a RefundRequest. Ugh!
  fees: ?FeesStateType,
  depositAccountNum: ?number,
  reason: ?string,
  rationale: ?string,
  name: ?RefundRequestNameStateType,
  names: ?RefundRequestNamesStateType,
  address: ?RefundRequestAddressStateType,
  addresses: ?RefundRequestAddressesStateType,
  phone: ?number,
  isLoadingPaymentHistory: ?boolean,
  isLoadingNames: ?boolean,
  isLoadingAddresses: ?boolean,
  attorneyDocketNum: ?number,
  acknowledgement: ?boolean,
  requestDate: ?string
}

export type RefundRequestFormDataType = {
  refundRequestForm: ?RefundRequestFormStateType
}

export type RefundRequestStateType = {
  pdf: PdfStateType,
  lookupForm: LookupStateType,
  refundRequestForm: RefundRequestFormStateType,
  save: SaveRequestStateType,
  isIssue: boolean,
  isShowSystemError: boolean,
  isResettingRefundForm: boolean,
  isNegativeTesting: boolean,
  issueReport: Array<RequestIssueReportType>
}

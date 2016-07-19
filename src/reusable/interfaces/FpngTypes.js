import {Url} from 'url'

export type ActionPayloadType = {
  type: string,
  meta: ?Object,
  payload: ?any
}

export type RequestIssueReportType = {
  statusCode: number,
  statusText: string,
  errorCode: ?number,
  errorMessageText: ?Array<string>,
  infoMessageText: ?Array<string>,
  warnMessageText: ?Array<string>
}

export type RequestIssuePayloadType = RequestIssueReportType

export type MapToStringType = { [key: string]: string }
export type MapToUrlType = { [key: string]: Url}
export type MapToAnyType = { [key: string]: any }
export type StateMapType = MapToAnyType

export type MapToFunctionType = { [key: string]: Function }
export type MapActionNameToCreatorFuctType = MapToFunctionType

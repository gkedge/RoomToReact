export type ActionPayloadType = {
  type: string,
  meta: ?Object,
  payload: ?any
}

export type RequestErrorReportType = {
  statusCode: number,
  statusText: string,
  errorCode:  ?number,
  errorMessageText: ?Array<string>,
  infoMessageText: ?Array<string>,
  warnMessageText: ?Array<string>
}

export type StateMapType = { [key: string]: any }
export type MapOfActionCreatorsType = { [key: string]: Function }

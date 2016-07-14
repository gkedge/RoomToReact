export type ActionPayloadType = {
  type: string,
  meta: ?Object,
  payload: ?any
}

export type RequestErrorReportType = {
  statusCode: number,
  statusText: string,
  errorMessageText: ?Array<string>,
  infoMessageText: ?Array<string>,
  warnMessageText: ?Array<string>
}


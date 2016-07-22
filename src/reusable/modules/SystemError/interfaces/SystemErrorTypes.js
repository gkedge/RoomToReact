
import {Url} from 'url'

export type SystemErrorReportType = {
  errorMessageText: string,
  actionThatFailed: ?string,
  reqUrl: ?Url,
  httpStatusCode: ?number,
  httpStatusText: ?string,
  fpngErrorCode: ?number,
}

export type TimeStampedSystemErrorReportType = {
  id: string,
  receivedAt: string, // ISO Data/Time
  sysErrReport: SystemErrorReportType
}

export type SystemErrorReportPayloadType = TimeStampedSystemErrorReportType

export type TimeStampedSystemErrorReportsType = Array<TimeStampedSystemErrorReportType>

export type SystemErrorStateType = {
  sysErrReports: TimeStampedSystemErrorReportsType
}
/* @flow */

import type {
  SystemErrorReportPayloadType as PayloadType,
  SystemErrorReportType as ReportType,
  SystemErrorStateType as StateType,
  TimeStampedSystemErrorReportType as TimeStampedReportType
} from './SystemErrorTypes'


// Public API
export type SystemErrorReportType = ReportType

// Public Functions
export systemErrorReducer, {
  initialState as systemErrorInitialState,
  raiseSystemError,
  clearSystemErrors
} from './SystemErrorMod'

// Public component
export default from './SystemError'

// Only used by UT
export type SystemErrorReportPayloadType = PayloadType
export type SystemErrorStateType = StateType
export type TimeStampedSystemErrorReportType = TimeStampedReportType

export {
  SYS_ERROR_ADDED,
  SYS_ERROR_CLEARED
} from './SystemErrorMod'


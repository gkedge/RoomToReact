/* @flow */

import type {ActionPayloadType} from 'reusable/interfaces/FpngTypes'
import type {
  SystemErrorReportPayloadType as PayloadType, // Only used by UT
  SystemErrorReportType as ReportType,
  SystemErrorStateType as StateType, // Only used by UT
  TimeStampedSystemErrorReportType as TimeStampedReportType // Only used by UT
} from './SystemErrorTypes'

import {unknownAction} from 'reusable/utilities/reduxStoreUtils'

import component from './SystemError'
import reducer, {
  initialState,
  SYS_ERROR_ADDED as sysErrorAdded, // Only used by UT
  SYS_ERROR_CLEARED as sysErrorCleared, // Only used by UT
  raiseSystemError as raise,
  clearSystemErrors as clear
} from './SystemErrorMod'

export const SYS_ERROR_ADDED   = sysErrorAdded // Only used by UT
export const SYS_ERROR_CLEARED = sysErrorCleared // Only used by UT

// Public API
export type SystemErrorReportPayloadType = PayloadType
export type SystemErrorReportType = ReportType
export type SystemErrorStateType = StateType
export type TimeStampedSystemErrorReportType = TimeStampedReportType

// Public Functions
export const raiseSystemError        = (sysErrReport:any):ActionPayloadType => raise(sysErrReport)
export const clearSystemErrors       = ():ActionPayloadType => clear()
export const systemErrorReducer      =
               (state:SystemErrorStateType = initialState,
                action:ActionPayloadType = unknownAction):SystemErrorStateType =>
                 reducer(state, action)

// Public constants and components
export const systemErrorInitialState:SystemErrorStateType = initialState
export default component

/* @flow */

import type {
  RequestErrorReportType
} from 'reusable/interfaces/FpngTypes'

import BaseCustomError from 'reusable/errors/BaseCustomError'

/*eslint no-useless-constructor: 0*/

// http://stackoverflow.com/a/32749533
export default class RequestError extends BaseCustomError {
  constructor(requestErrorReport:RequestErrorReportType) {
    super(requestErrorReport)
  }
}

/* @flow */

import type {
  RequestIssueReportType
} from 'reusable/interfaces/FpngTypes'

import BaseCustomError from 'reusable/errors/BaseCustomError'

/*eslint no-useless-constructor: 0*/

// http://stackoverflow.com/a/32749533
export default class RequestIssue extends BaseCustomError {
  constructor(requestIssueReport:RequestIssueReportType) {
    super(requestIssueReport)
  }
}

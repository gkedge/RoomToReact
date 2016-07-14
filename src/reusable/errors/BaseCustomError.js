/* @flow */

// http://stackoverflow.com/a/32749533
const hasStackTrace = (():boolean => {
  try {
    let stackTrace = {}
    Error.captureStackTrace(stackTrace, "")
    return true
  }
  catch (e) {
    return false
  }
})()

export default class BaseCustomError extends Error {
  constructor(message:any) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    if (hasStackTrace) {
      let stackTrace = {}
      Error.captureStackTrace(stackTrace, this.constructor)
      this.stack = stackTrace
    }
    else {
      this.stack = (new Error(message)).stack
    }
  }
}
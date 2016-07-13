/* @ flow */
import {isFunction} from '../testUtilities.spec'
import type {ActionPayloadType} from 'reusable/interfaces/FpngTypes'

export const reducerSpy = (reducer, stateHolder) => {
  const _getStateSpy = sinon.spy(() => {
    return stateHolder.state
  })
  const _dispatchSpy = sinon.spy((action:any):any => {
    if (isFunction(action)) {
      const returnVal = action(_dispatchSpy, _getStateSpy)
      if (returnVal instanceof ActionPayloadType) {
        _dispatchSpy(returnVal)
      }
      else {
        return returnVal
      }
    }
    else {
      stateHolder.state.refundRequest = reducer(stateHolder.state.refundRequest, action)
    }
  })
  return {dispatchSpy: _dispatchSpy, getStateSpy: _getStateSpy}
}

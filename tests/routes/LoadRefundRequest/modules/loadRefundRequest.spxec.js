import reducer, { initialState,
  actions,
  REQUEST_LOAD_REFUND_REQUEST
} from 'routes/LoadRefundRequest/modules/loadRefundRequest'

// http://redux.js.org/docs/recipes/WritingTests.html

describe('(Route) loadRefundRequest', () => {
  describe('actions', () => {
    it('should create an action to add a todo', () => {
      const expectedAction = {
        type: REQUEST_LOAD_REFUND_REQUEST,
        payload: {
          isLoading: true
        }
      }

      expect(actions.requestLoadRefundRequest()).toEqual(expectedAction)
    })
  })

  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(reducer(undefined, {})).to.eql(initialState)
    })
  })
})

import loadRefundRequestReducer, { initialState,
  actions,
  REQUEST_LOAD_REFUND_REQUEST
} from 'routes/LoadRefundRequest/modules/loadRefundRequest'

// http://redux.js.org/docs/recipes/WritingTests.html

describe('(Route Module) requestLoadRefundRequest', () => {
  describe('Actions', () => {
    it('should create an action to load refund request', () => {
      const expectedAction = {
        type: REQUEST_LOAD_REFUND_REQUEST,
        payload: {
          isLoading: true
        }
      }

      expect(actions.requestLoadRefundRequest()).to.eql(expectedAction)
    })
  })

  describe('(Reducer)', () => {
    it('sets up initial state', () => {
      expect(loadRefundRequestReducer(undefined, {})).to.eql(initialState)
    })
  })
})

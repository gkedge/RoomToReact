import LoadRefundRequestRoute from 'routes/LoadRefundRequest'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.

describe('(Route) LoadRefundRequest', () => {
  let _route

  beforeEach(() => {
    _route = LoadRefundRequestRoute({})
  })

  it('Should return a route configuration object', () => {
    expect(typeof(_route)).to.equal('object')
  })

  it('Configuration should contain path `loadRefundRequest`', () => {
    expect(_route.path).to.equal('loadRefundRequest')
  })

})

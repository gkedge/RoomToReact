// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.

import LoadRefundRequestRoute from 'routes/LoadRefundRequest'

describe('(Route) LoadRefundRequest', () => {
  let _route

  beforeEach(() => {
    _route = LoadRefundRequestRoute({})
  })

  it('Should return a route configuration object', () => {
    expect(typeof(_route)).to.equal('object')
  })

  it('Configuration should contain path `load`', () => {
    expect(_route.path).to.equal('load')
  })

})

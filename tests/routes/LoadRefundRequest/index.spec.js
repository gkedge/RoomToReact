import LoadRefundRequestRoute from 'routes/LoadRefundRequest'

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

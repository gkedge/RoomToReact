import zenReducer, {
  REQUEST_ZEN, RECEIVE_ZEN, SAVE_CURRENT_ZEN,
  actions,
  initialState
} from 'routes/Zen/modules/zen'

import fetchMock from 'fetch-mock'
// import configureMockStore from 'redux-mock-store'
// import thunk from 'redux-thunk'

// const middlewares = [thunk]
// const mockStore = configureMockStore(middlewares)

describe('(Route Module) Zen', () => {
  it('Should export a constant REQUEST_ZEN.', () => {
    expect(REQUEST_ZEN).to.equal('REQUEST_ZEN')
  })

  it('Should export a constant RECEIVE_ZEN.', () => {
    expect(RECEIVE_ZEN).to.equal('RECEIVE_ZEN')
  })

  it('Should export a constant SAVE_CURRENT_ZEN.', () => {
    expect(SAVE_CURRENT_ZEN).to.equal('SAVE_CURRENT_ZEN')
  })

  describe('(Action Creator) requestZen', () => {
    it('Should be exported as a function.', () => {
      expect(actions.requestZen).to.be.a('function')
    })

    it('Should return an action with type "REQUEST_ZEN".', () => {
      expect(actions.requestZen()).to.have.property('type', REQUEST_ZEN)
    })

  })

  describe('(Action Creator) receiveZen', () => {
    it('Should be exported as a function.', () => {
      expect(actions.receiveZen).to.be.a('function')
    })

    it('Should return an action with type "RECEIVE_ZEN".', () => {
      expect(actions.receiveZen('Yow')).to.have.property('type', RECEIVE_ZEN)
    })

    it('Should assign the first argument to the "payload.value" property.', () => {
      expect(actions.receiveZen('Yow')).to.have.property('payload').and.eql({ value: 'Yow', id: 1 })
    })

    it('Should default the "payload.value" property to empty string.', () => {
      expect(actions.receiveZen('')).to.have.property('payload').and.eql({ value: '', id: 2 })
    })
  })

  describe('(Action Creator) saveCurrentZen', () => {
    it('Should be exported as a function.', () => {
      expect(actions.saveCurrentZen).to.be.a('function')
    })

    it('Should return an action with type "SAVE_CURRENT_ZEN".', () => {
      expect(actions.saveCurrentZen()).to.have.property('type', SAVE_CURRENT_ZEN)
    })

  })

  describe('(Action Creator) fetchZen', () => {
    let _globalState, _dispatchSpy, _getStateSpy

    beforeEach(() => {
      _globalState = {
        zen: zenReducer(undefined, {})
      }
      _dispatchSpy = sinon.spy((action) => {
        _globalState = {
          ..._globalState,
          zen: zenReducer(_globalState.zen, action)
        }
      })
      _getStateSpy = sinon.spy(() => {
        return _globalState
      })

      fetchMock.mock('https://api.github.com/zen', 'GET', 'I like turtles!')

    })

    afterEach(() => {
      fetchMock.restore()
    })


    it('Should be exported as a function.', () => {
      expect(actions.fetchZen).to.be.a('function')
    })

    it('Should return a function (is a thunk).', () => {
      expect(actions.fetchZen()).to.be.a('function')
    })

    it('Fetching zen through store returns a Promise', () => {
      return expect(actions.fetchZen()(_dispatchSpy)).to.eventually.be.fulfilled
    })

    it('State after fetch contains zens.', () => {
      return actions.fetchZen()(_dispatchSpy)
        .then(() => {
          expect(_dispatchSpy).to.have.been.calledTwice;
          expect(fetchMock.called('https://api.github.com/zen')).to.be.true
          expect(_globalState.zen.zens[0].value).to.equal('I like turtles!')
        })
    })
  })

  // NOTE: Probably want to verify that state hasn't been mutated).
  describe('(Action Handler) basic reduce tests', () => {
    it('Should be a function.', () => {
      expect(zenReducer).to.be.a('function')
    })

    it('Should initialize with `initialState`.', () => {
      expect(zenReducer(undefined, {})).to.equal(initialState)
    })

    it('Passing `undefined` to reducer should produce initialState', () => {
      let state = zenReducer(undefined, {})
      expect(state).to.eql(initialState)
      state = zenReducer(state, { type: '@@@@@@@' })
      expect(state).to.eql(initialState)
    })
  })
  
  describe('(Action Handler) REQUEST_ZEN', () => {
    it('Passing `requestZen()` to reducer should produce fetching truth', () => {
      const expected ={ fetching: true, current: null, zens: [], saved: [] }
      let state = zenReducer(initialState, actions.requestZen())
      expect(state).to.eql(expected)
      state = zenReducer(state, {type: '@@@@@@@'})
      expect(state).to.eql(expected)
    })
  })
  
  describe('(Action Handler) RECEIVE_ZEN', () => {
    it('Passing `receiveZen()` to reducer should produce fetching falsity with `zen-like` wisdom', () => {
      let state = zenReducer(initialState, actions.receiveZen('Yow'))
      
      expect(state).to.eql({ fetching: false, current: 5, zens: [{"value":"Yow","id":5}], saved: [] })
    })
  })
  
  describe('(Action Handler) SAVE_CURRENT_ZEN', () => {
    it('Passing `receiveZen()` to reducer should produce fetching falsity with saved `zen-like` wisdom', () => {
      let state = zenReducer(initialState, actions.receiveZen('Yow'))
      state = zenReducer(state, actions.saveCurrentZen())
      
      expect(state).to.eql({ fetching: false, current: 6, zens: [{"value":"Yow","id":6}], saved: [6] })
    })
  })  
})

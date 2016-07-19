import <%= camelEntityName %>Reducer, {
  // Add action constants:
  REQUEST_, RECEIVE_, SAVE_,
  actions,
  initialState,
  testOnlyModuleReset
} from 'routes/<%= pascalEntityName %>/modules/<%= camelEntityName %>'

// http://redux.js.org/docs/recipes/WritingTests.html
// Disregard any reference to nock as that is a server-side
// only solution; using fetch-mock instead.
// import fetchMock from 'fetch-mock'

describe('(Route Module) <%= pascalEntityName %>', () => {
  describe('(Actions)', () => {
    afterEach(() => {
      testOnlyModuleReset()
    })

    it('Should export a constant REQUEST_.', () => {
      expect(REQUEST_).to.equal('REQUEST_')
    })
    it('Should export a constant RECEIVE_.', () => {
      expect(RECEIVE_).to.equal('RECEIVE_')
    })

    it('Should export a constant SAVE_CURRENT_.', () => {
      expect(SAVE_CURRENT_).to.equal('SAVE_CURRENT_')
    })

    describe('(Action Creator) request<%= pascalEntityName %>', () => {
      it('Should be exported as a function.', () => {
        expect(actions.request<%= pascalEntityName %>).to.be.a('function')
      })

      it('Should return an action with type "REQUEST_".', () => {
        expect(actions.request<%= pascalEntityName %>()).to.have.property('type', REQUEST_)
      })
    })

    describe('(Action Creator) receive<%= pascalEntityName %>', () => {
      it('Should be exported as a function.', () => {
        expect(actions.receive<%= pascalEntityName %>).to.be.a('function')
      })

      it('Should return an action with type "RECEIVE_".', () => {
        expect(actions.receive<%= pascalEntityName %>('Yow')).to.have.property('type', RECEIVE_)
      })

      it('Should assign the first argument to the "payload.value" property.', () => {
        expect(actions.receive<%= pascalEntityName %>('Yow')).to.have.property('payload').and.eql({value: 'Yow', id: 0})
      })

      it('Should default the "payload.value" property to empty string.', () => {
        expect(actions.receive<%= pascalEntityName %>('')).to.have.property('payload').and.eql({value: '', id: 0})
      })
    })

    describe('(Action Creator) saveCurrent<%= pascalEntityName %>', () => {
      it('Should be exported as a function.', () => {
        expect(actions.saveCurrent<%= pascalEntityName %>).to.be.a('function')
      })

      it('Should return an action with type "SAVE_CURRENT_".', () => {
        expect(actions.saveCurrent<%= pascalEntityName %>()).to.have.property('type', SAVE_CURRENT_)
      })
    })

    describe('(Action Creator) fetch<%= pascalEntityName %>', () => {
      let _globalState, _dispatchSpy, _getStateSpy

      beforeEach(() => {
        _globalState = {
        <%= camelEntityName %>: <%= camelEntityName %>Reducer(undefined, {})
        }
        _dispatchSpy = sinon.spy((action) => {
          _globalState = {
            ..._globalState,
          <%= camelEntityName %>: <%= camelEntityName %>Reducer(_globalState.<%= camelEntityName %>, action)
          }
        })
        _getStateSpy = sinon.spy(() => {
          return _globalState
        })

        fetchMock.mock('https://api.github.com/<%= camelEntityName %>', 'GET', 'I like turtles!')
      })

      afterEach(() => {
        fetchMock.restore()
      })

      it('Should be exported as a function.', () => {
        expect(actions.fetch<%= pascalEntityName %>).to.be.a('function')
      })

      it('Should return a function (is a thunk).', () => {
        expect(actions.fetch<%= pascalEntityName %>()).to.be.a('function')
      })

      it('Fetching <%= camelEntityName %> through store returns a Promise', () => {
        return expect(actions.fetch<%= pascalEntityName %>()(_dispatchSpy)).to.eventually.be.fulfilled
      })

      it('State after fetch contains <%= camelEntityName %>s.', () => {
        return actions.fetch<%= pascalEntityName %>()(_dispatchSpy)
          .then(() => {
            expect(_dispatchSpy).to.have.been.calledTwice;
            expect(fetchMock.called('https://api.github.com/<%= camelEntityName %>')).to.be.true
            expect(_globalState.<%= camelEntityName %>.<%= camelEntityName %>s[0].value).to.equal('I like turtles!')
          })
      })
    })

    describe('(Action Creator) saveCurrent<%= pascalEntityName %>', () => {
      it('Should be exported as a function.', () => {
        expect(actions.saveCurrent<%= pascalEntityName %>).to.be.a('function')
      })

      it('Should return an action with type "SAVE_CURRENT_".', () => {
        expect(actions.saveCurrent<%= pascalEntityName %>()).to.have.property('type', SAVE_CURRENT_)
      })
    })

    describe('(Action Creator) fetch<%= pascalEntityName %>', () => {
      let _globalState, _dispatchSpy, _getStateSpy

      beforeEach(() => {
        _globalState = {
          <%= camelEntityName %>: <%= camelEntityName %>Reducer(undefined, {})
        }
        _dispatchSpy = sinon.spy((action) => {
          _globalState = {
            ..._globalState,
            <%= camelEntityName %>: <%= camelEntityName %>Reducer(_globalState.<%= camelEntityName %>, action)
          }
        })
        _getStateSpy = sinon.spy(() => {
          return _globalState
        })

        fetchMock.mock('https://api.github.com/<%= camelEntityName %>', 'GET', 'I like turtles!')
      })

      afterEach(() => {
        fetchMock.restore()
      })

      it('Should be exported as a function.', () => {
        expect(actions.fetch<%= pascalEntityName %>).to.be.a('function')
      })

      it('Should return a function (is a thunk).', () => {
        expect(actions.fetch<%= pascalEntityName %>()).to.be.a('function')
      })

      it('Fetching <%= camelEntityName %> through store returns a Promise', () => {
        return expect(actions.fetch<%= pascalEntityName %>()(_dispatchSpy)).to.eventually.be.fulfilled
      })

      it('State after fetch contains <%= camelEntityName %>s.', () => {
        return actions.fetch<%= pascalEntityName %>()(_dispatchSpy)
          .then(() => {
            expect(_dispatchSpy).to.have.been.calledTwice;
            expect(fetchMock.called('https://api.github.com/<%= camelEntityName %>')).to.be.true
            expect(_globalState.<%= camelEntityName %>.<%= camelEntityName %>s[0].value).to.equal('I like turtles!')
          })
      })
    })

    // NOTE: Probably want to verify that state hasn't been mutated).
    describe('(Action Handler) basic reduce tests', () => {
      it('Should be a function.', () => {
        expect(<%= camelEntityName %>Reducer).to.be.a('function')
      })

      it('Should initialize with `initialState`.', () => {
        expect(<%= camelEntityName %>Reducer(undefined, {})).to.equal(initialState)
      })

      it('Passing `undefined` to reducer should produce initialState', () => {
        let state = <%= camelEntityName %>Reducer(undefined, {})
        expect(state).to.eql(initialState)
        state = <%= camelEntityName %>Reducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(initialState)
      })
    })

    describe('(Action Handler) REQUEST_', () => {
      it('Passing `request<%= pascalEntityName %>()` to reducer should produce fetching truth', () => {
        const expected = {fetching: true, current: null, <%= camelEntityName %>s: [], saved: []}
        let state = <%= camelEntityName %>Reducer(initialState, actions.request<%= pascalEntityName %>())
        expect(state).to.eql(expected)
        state = <%= camelEntityName %>Reducer(state, {type: '@@@@@@@'})
        expect(state).to.eql(expected)
      })
    })

    describe('(Action Handler) RECEIVE_', () => {
      it('Passing `receive<%= pascalEntityName %>()` to reducer should produce fetching falsity with `<%= camelEntityName %>-like` wisdom', () => {
        let state = <%= camelEntityName %>Reducer(initialState, actions.receive<%= pascalEntityName %>('Yow'))

        expect(state).to.eql({fetching: false, current: 0, <%= camelEntityName %>s: [{"value": "Yow", "id": 0}], saved: []})
      })
    })

    describe('(Action Handler) SAVE_CURRENT_', () => {
      it('Passing `receive<%= pascalEntityName %>()` to reducer should produce fetching falsity with saved `<%= camelEntityName %>-like` wisdom', () => {
        let state = <%= camelEntityName %>Reducer(initialState, actions.receive<%= pascalEntityName %>('Yow'))
        state = <%= camelEntityName %>Reducer(state, actions.saveCurrent<%= pascalEntityName %>())

        expect(state).to.eql({fetching: false, current: 0, <%= camelEntityName %>s: [{"value": "Yow", "id": 0}], saved: [0]})
      })
    })
  })
})

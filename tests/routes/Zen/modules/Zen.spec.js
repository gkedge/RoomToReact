import zenReducer, {
    REQUEST_ZEN, RECEIVE_ZEN, SAVE_CURRENT_ZEN,
    actions,
    initialState
} from 'routes/Zen/modules/zen'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import vcr from 'nock-vcr-recorder-mocha'

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
            expect(actions.).to.be.a('function')
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

    vcr.describe('(Action Creator) fetchZen', () => {
        afterEach(() => {
            nock.cleanAll()
        })

        it('Should be exported as a function.', () => {
            expect(actions.fetchZen).to.be.a('function')
        })
      
        it('Should return a function (is a thunk).', () => {
          expect(actions.fetchZen()).to.be.a('function')
        })
      
        it('Should return a promise from that thunk that gets fulfilled.', () => {
            const expectedActions = [
                { type: types.REQUEST_ZEN },
                { type: types.RECEIVE_ZEN, payload: { value: 'Some Zen'  } }
            ]
            const store = mockStore({ todos: [] })
            
            return store.dispatch(actions.fetchZen())
    
          return actions.fetchZen()(_dispatchSpy).should.eventually.be.fulfilled
        })

      let _globalState
      let _dispatchSpy
      let _getStateSpy
    
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
      })
    
      it('Should be exported as a function.', () => {
        expect(doubleAsync).to.be.a('function')
      })
    
      it('Should return a function (is a thunk).', () => {
        expect(doubleAsync()).to.be.a('function')
      })
    
      it('Should return a promise from that thunk that gets fulfilled.', () => {
        return doubleAsync()(_dispatchSpy).should.eventually.be.fulfilled
      })
    
      it('Should call dispatch and getState exactly once.', () => {
        return doubleAsync()(_dispatchSpy, _getStateSpy)
          .then(() => {
            _dispatchSpy.should.have.been.calledOnce
            _getStateSpy.should.have.been.calledOnce
          })
      })
    
      it('Should produce a state that is double the previous state.', () => {
        _globalState = { zen: 2 }
    
        return doubleAsync()(_dispatchSpy, _getStateSpy)
          .then(() => {
            _dispatchSpy.should.have.been.calledOnce
            _getStateSpy.should.have.been.calledOnce
            expect(_globalState.zen).to.equal(4)
            return doubleAsync()(_dispatchSpy, _getStateSpy)
          })
          .then(() => {
            _dispatchSpy.should.have.been.calledTwice
            _getStateSpy.should.have.been.calledTwice
            expect(_globalState.zen).to.equal(8)
          })
      })
    })

    // NOTE: if you have a more complex state, you will probably want to verify
    // that you did not mutate the state. In this case our state is just a number
    // (which cannot be mutated).
    describe('(Action Handler) REQUEST_ZEN', () => {
        it('Should be a function.', () => {
            expect(zenReducer).to.be.a('function')
        })
    
        it('Should initialize with `initialState`.', () => {
            expect(zenReducer(undefined, {})).to.equal(initialState)
        })

        it('Should increment the state by the action payload\'s "value" property.', () => {
            let state = zenReducer(undefined, {})
            expect(state).to.equal(initialState)
            state = zenReducer(state, { type: '@@@@@@@' })
            expect(state).to.equal(initialState)
            // state = zenReducer(state, fetchZen())
            // expect(state).to.equal(5)
            // state = zenReducer(state, {type: '@@@@@@@'})
            // expect(state).to.equal(5)
        })
    })
})

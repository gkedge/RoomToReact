/* @flow */
import type { <%= pascalEntityName %>Object } from '../interfaces/<%= camelEntityName %>'
import { connect } from 'react-redux'
import { fetch<%= pascalEntityName %>, save<%= pascalEntityName %> } from '../modules/<%= camelEntityName %>'

/*  This is a container component. Notice it does not contain any JSX,
    nor does it import React. This component is **only** responsible for
    wiring in the actions and state necessary to render a presentational
    component. */

import <%= pascalEntityName %> from '../components/<%= pascalEntityName %>'

/*  Object of action creators (can also be function that returns object).
    Keys will be passed as props to presentational components. Here we are
    implementing our wrapper around increment; the component doesn't care   */

const mapActionCreators: {fetch<%= pascalEntityName %>: Function, saveCurrent<%= pascalEntityName %>: Function} = {
  fetch<%= pascalEntityName %>,
  saveCurrent<%= pascalEntityName %>
}

const mapStateToProps = (state): { <%= camelEntityName %>: ?<%= pascalEntityName %>Object, saved: Array<<%= pascalEntityName %>Object> } => ({
<%= camelEntityName %>: state.<%= camelEntityName %>.<%= camelEntityName %>s.find(<%= camelEntityName %> => <%= camelEntityName %>.id === state.<%= camelEntityName %>.current),
saved: state.<%= camelEntityName %>.<%= camelEntityName %>s.filter(<%= camelEntityName %> => state.<%= camelEntityName %>.saved.indexOf(<%= camelEntityName %>.id) !== -1)
})

/*  Note: mapStateToProps is where you should use `reselect` to create selectors, ie:

    import { createSelector } from 'reselect'
    const counter = (state) => state.counter
    const tripleCount = createSelector(counter, (count) => count * 3)
    const mapStateToProps = (state) => ({
      counter: tripleCount(state)
    })

    Selectors can compute derived data, allowing Redux to store the minimal possible state.
    Selectors are efficient. A selector is not recomputed unless one of its arguments change.
    Selectors are composable. They can be used as input to other selectors.
    https://github.com/reactjs/reselect    */

export default connect(mapStateToProps, mapActionCreators)(<%= pascalEntityName %>)

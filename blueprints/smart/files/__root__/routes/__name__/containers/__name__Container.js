/* @flow */
import type { <%= pascalEntityName %>Object } from '../interfaces/<%= camelEntityName %>'
import { connect } from 'react-redux'
import { fetch<%= pascalEntityName %>, save<%= pascalEntityName %> } from '../modules/<%= camelEntityName %>'

import <%= pascalEntityName %> from '../components/<%= pascalEntityName %>'

const mapStateToProps = (state): { <%= camelEntityName %>: ?<%= pascalEntityName %>Object, saved: Array<<%= pascalEntityName %>Object> } => ({
  <%= camelEntityName %>: state.<%= camelEntityName %>.<%= camelEntityName %>s.find(<%= camelEntityName %> => <%= camelEntityName %>.id === state.<%= camelEntityName %>.current),
  saved: state.<%= camelEntityName %>.<%= camelEntityName %>s.filter(<%= camelEntityName %> => state.<%= camelEntityName %>.saved.indexOf(<%= camelEntityName %>.id) !== -1)
})

const mapActionCreators: {fetch<%= pascalEntityName %>: Function, saveCurrent<%= pascalEntityName %>: Function} = {
          fetch<%= pascalEntityName %>,
      saveCurrent<%= pascalEntityName %>
}

export default connect(mapStateToProps, mapActionCreators)(<%= pascalEntityName %>)

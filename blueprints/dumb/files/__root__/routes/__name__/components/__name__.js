/* @flow */
import React from 'react'
import classes from './<%= pascalEntityName %>.scss'

import type { <%= pascalEntityName %>Object } from '../interfaces/<%= camelEntityName %>'

type Props = {
  <%= camelEntityName %>: ?<%= pascalEntityName %>Object,
  saved: Array<<%= pascalEntityName %>Object>,
  fetch<%= pascalEntityName %>: Function,
  saveCurrent<%= pascalEntityName %>: Function
}

export class <%= pascalEntityName %> extends React.Component {
  props: Props;

  render () {
    return (
      <div>
        
      </div>
    )
  }
}

<%= pascalEntityName %>.propTypes = {
  <%= camelEntityName %>: React.PropTypes.object,
  saved: React.PropTypes.array.isRequired,
  fetch<%= pascalEntityName %>: React.PropTypes.func.isRequired,
  saveCurrent<%= pascalEntityName %>: React.PropTypes.func.isRequired
}

export default <%= pascalEntityName %>


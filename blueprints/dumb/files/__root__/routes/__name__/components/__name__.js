/* @flow */
/*eslint no-useless-constructor: 0*/

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

  constructor(props:Props) {
    super(props)
    //this.onFileOpen = this.onFileOpen.bind(this)
    //this.onBinaryContentAvailable = this.onBinaryContentAvailable.bind(this)
  }

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


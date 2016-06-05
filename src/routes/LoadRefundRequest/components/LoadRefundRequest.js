/* @flow */
import React from 'react'
import classes from './LoadRefundRequest.scss'

import type { LoadRefundRequestObject, SaveRefundRequestObject } from '../interfaces/LoadRefundRequestTypes'

type Props = {
  loadRefundRequestData: ?LoadRefundRequestObject,
  saveRefundRequestData: SaveRefundRequestObject,
  fetchRefundRequestFile : Function,
  saveRefundRequest: Function
}

export class LoadRefundRequest extends React.Component {
  constructor(props:Props) {
    super(props)
  }

  render () {
    return (
      <div>
         I like Turtles!
      </div>
    )
  }
}


LoadRefundRequest.propTypes = {
  loadRefundRequestData: React.PropTypes.object,
  saveRefundRequestData: React.PropTypes.object.isRequired,
  fetchRefundRequestFile: React.PropTypes.func.isRequired,
  saveRefundRequest: React.PropTypes.func.isRequired
}

export default LoadRefundRequest


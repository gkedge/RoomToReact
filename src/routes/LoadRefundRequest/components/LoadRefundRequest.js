/* @flow */
/*eslint no-useless-constructor: 0*/

import React from 'react'
import classes from './LoadRefundRequest.scss'

// import type { PdfObject } from 'components/Pdf/interfaces/PdfTypes.js'
import type { LoadRefundRequestObject, SaveRefundRequestObject } from '../interfaces/LoadRefundRequestTypes'
// import Pdf from '../../../components/Pdf/Pdf'

type Props = {
  pdf: ?PdfObject,
  loadRefundRequestData: ?LoadRefundRequestObject,
  saveRefundRequestData: ?SaveRefundRequestObject,
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
        PDF!!
      </div>
    )
  }
}


LoadRefundRequest.propTypes = {
  pdf: React.PropTypes.object,
  loadRefundRequestData: React.PropTypes.object,
  saveRefundRequestData: React.PropTypes.object,
  fetchRefundRequestFile: React.PropTypes.func.isRequired,
  saveRefundRequest: React.PropTypes.func.isRequired
}

export default LoadRefundRequest


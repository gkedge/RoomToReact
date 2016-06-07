/* @flow */
import React from 'react'
import classes from './Pdf.scss'

import type {PdfObject} from './interfaces/PdfTypes'

type Props = ?PdfObject

export class Pdf extends React.Component {

  constructor(props:Props) {
    super(props)
  }

  render() {
    return (
      <div>
        PDF!!
      </div>
    )
  }
}

Pdf.propTypes = React.PropTypes.object

export default Pdf


/* @flow */
import React from 'react'
import classes from './Pdf.scss'

// import type {PdfObject} from './interfaces/PdfTypes'

type Props = {
  isLoading: boolean,
  file: ?string,
  content: ?string,
  page: ?number,
  scale: ?number,
  onDocumentComplete : Function,
  onPageComplete: Function
}

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

Pdf.propTypes = {
  isLoading         : React.PropTypes.boolean,
  file              : React.PropTypes.string,
  content           : React.PropTypes.string,
  page              : React.PropTypes.number,
  scale             : React.PropTypes.number,
  onDocumentComplete: React.PropTypes.func,
  onPageComplete    : React.PropTypes.func
}

export default Pdf


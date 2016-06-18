/* @flow */
import type {PdfData, LookupFormData, SaveRefundRequestPayload} from '../interfaces/LoadRefundRequestTypes'
import React from 'react'
import PdfPanel from 'reusable/components/PdfPanel/PdfPanel'
import LookupForm from './LookupForm'
// import pick from 'lodash/pick'

type Props = {
  pdfData: ? PdfData,
  lookupFormData: ? LookupFormData,
  saveRefundRequestData: ? SaveRefundRequestPayload,
  loadingPdf: Function,
  pdfBinary: Function,
  pdfLoaded: Function,
  resetState: Function
}

export class LoadRefundRequest extends React.Component {
  constructor(props:Props) {
    super(props)
    this.onFileOpen = this.onFileOpen.bind(this)
    this.onDocumentComplete = this.onDocumentComplete.bind(this)
    this.onBinaryContentAvailable = this.onBinaryContentAvailable.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  // componentWillReceiveProps(newProps:Props) {
  //  console.log(JSON.stringify(newProps))
  // }

  onFileOpen(file) {
    this.props.loadingPdf(file)
  }

  onBinaryContentAvailable(pdfRaw) {
    this.props.pdfBinary(pdfRaw)
  }

  onDocumentComplete() {
    this.props.pdfLoaded()
  }

  handleSubmit(data) {
    console.log("Lookup submit values: " + JSON.stringify(data))
  }

  componentWillUnmount() {
    this.props.resetState()
  }

  render() {
    return (
      <section className='flex-container'>
        <PdfPanel { ...this.props.pdfData.pdf}
          onFileOpen={this.onFileOpen}
          onDocumentComplete={this.onDocumentComplete}
          onBinaryContentAvailable={this.onBinaryContentAvailable}
        />
        <LookupForm { ...this.props.lookupFormData } onSubmit={this.handleSubmit} />
      </section>
    )
  }
}

LoadRefundRequest.displayName = 'LoadRefundRequest'
LoadRefundRequest.propTypes = {
  pdfData:               React.PropTypes.object,
  lookupFormData:        React.PropTypes.object,
  saveRefundRequestData: React.PropTypes.object,
  onFileOpen:            React.PropTypes.func,
  loadingPdf:            React.PropTypes.func.isRequired,
  pdfBinary:             React.PropTypes.func.isRequired,
  pdfLoaded:             React.PropTypes.func.isRequired,
  resetState:            React.PropTypes.func.isRequired
}

export default LoadRefundRequest


/* @flow */
import type {
  PdfDataType,
  LoadRefundRequestStateObjectType,
  LookupFormDataType,
  SaveRefundRequestPayloadType} from '../interfaces/LoadRefundRequestTypes'
import React from 'react'
import {Box, Center, Container} from 'react-layout-components'
import PdfPanel from 'reusable/components/PdfPanel/PdfPanel'
import LookupForm from './LookupForm'
// import pick from 'lodash/pick'

type PropType = {
  loadingPdf: Function,
  lookupFormData: ? LookupFormDataType,
  pdfBinary: Function,
  pdfData: ? PdfDataType,
  pdfLoaded: Function,
  resetState: Function,
  saveRefundRequestData: ? SaveRefundRequestPayloadType,
  validLookup: Function
}

export class LoadRefundRequest extends React.Component {
  constructor(props:PropType) {
    super(props)
    this.onFileOpen = this.onFileOpen.bind(this)
    this.onDocumentComplete = this.onDocumentComplete.bind(this)
    this.onBinaryContentAvailable = this.onBinaryContentAvailable.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  // componentWillReceiveProps(newProps:PropType) {
  //  console.log(JSON.stringify(newProps))
  // }

  onFileOpen(file:Object) {
    this.props.loadingPdf(file)
  }

  onBinaryContentAvailable(pdfRaw:Uint8Array) {
    this.props.pdfBinary(pdfRaw)
  }

  onDocumentComplete() {
    this.props.pdfLoaded()
  }

  // TODO: Why isn't the data type LookupStateType?
  handleSubmit(data:LookupFormDataType) {
    this.props.validLookup(data)
    console.log("Lookup submit values: " + JSON.stringify(data, null, 2))
  }

  componentWillUnmount() {
    this.props.resetState()
  }

  render():any {
    return (
      <section className='load-refund-request' key='load-refund-request-section' >
        <Box key='load-refund-request-layout-0' >
          <Center flex='1 0 auto' padding='1rem' key='load-refund-request-layout-0-0' >
            <Container padding='1rem' key='load-refund-request-layout-0-0-0' >
              <PdfPanel {...this.props.pdfData.pdf}
                onFileOpen={this.onFileOpen}
                onDocumentComplete={this.onDocumentComplete}
                onBinaryContentAvailable={this.onBinaryContentAvailable}
                key='load-refund-request-pdf-panel'
              />
            </Container>
          </Center>
          <Box flex='1 0 auto' key='load-refund-request-layout-1' >
            <Container padding='1rem' key='load-refund-request-layout-1-1' >
              <LookupForm {...this.props.lookupFormData}
                key='load-refund-lookup-form'
                onSubmit={this.handleSubmit} />
            </Container>
          </Box>
        </Box>
      </section>
    )
  }
}

LoadRefundRequest.displayName = 'LoadRefundRequest'
LoadRefundRequest.propTypes = {
  loadingPdf:            React.PropTypes.func.isRequired,
  lookupFormData:        React.PropTypes.object,
  onFileOpen:            React.PropTypes.func,
  pdfBinary:             React.PropTypes.func.isRequired,
  pdfData:               React.PropTypes.object,
  pdfLoaded:             React.PropTypes.func.isRequired,
  resetState:            React.PropTypes.func.isRequired,
  saveRefundRequestData: React.PropTypes.object,
  validLookup:           React.PropTypes.func.isRequired
}

export default LoadRefundRequest


/* @flow */
/*eslint no-useless-constructor: 0*/
import type {
  PdfDataType,
  RefundRequestFormDataType,
  LookupFormDataType
} from '../interfaces/RefundRequestTypes'
import React from 'react'
import {Box, VBox, Center, Flex, Container} from 'react-layout-components'
import PdfPanel from 'reusable/components/PdfPanel/PdfPanel'
import LookupForm from './LookupForm'
import RefundRequestForm from './RefundRequestForm'
// import pick from 'lodash/pick'

type PropType = {
  loadingPdf: Function,
  lookupFormData: LookupFormDataType,
  lookupReferencedData: Function,
  pdfBinary: Function,
  pdfData: PdfDataType,
  pdfLoaded: Function,
  refundRequestFormData: RefundRequestFormDataType,
  resetState: Function,
  saveRefundRequest: Function,
  validLookup: Function
}

export class RefundRequest extends React.Component {
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

  renderRefundRequest():Object {
    return (
      <RefundRequestForm {...this.props.refundRequestFormData}
        onSubmit={this.handleSubmit} />)
  }

  render():Object {
    return (
      <section className='load-refund-request'>
        <Box>
          <Center flex='1 0 auto'>
            <Container padding='1rem'>
              <PdfPanel {...this.props.pdfData.pdf}
                onFileOpen={this.onFileOpen}
                onDocumentComplete={this.onDocumentComplete}
                onBinaryContentAvailable={this.onBinaryContentAvailable}
              />
            </Container>
          </Center>
          <VBox>
            {/* This Box limits vertical space to the vertical size of form. */ }
            <Box justify-content='center'>
              <LookupForm {...this.props.lookupFormData}
                onSubmit={this.handleSubmit}/>
            </Box>
            {
              this.props.lookupFormData.lookupForm.referenceNum &&
              this.props.lookupFormData.lookupForm.dateFrom &&
              this.props.lookupFormData.lookupForm.dateTo &&
              this.renderRefundRequest()
            }
          </VBox>
        </Box>
      </section>)
  }
}

RefundRequest.displayName = 'RefundRequest'
RefundRequest.propTypes = {
  loadingPdf:            React.PropTypes.func.isRequired,
  lookupFormData:        React.PropTypes.object,
  lookupReferencedData:  React.PropTypes.func.isRequired,
  pdfBinary:             React.PropTypes.func.isRequired,
  pdfData:               React.PropTypes.object,
  pdfLoaded:             React.PropTypes.func.isRequired,
  refundRequestFormData: React.PropTypes.object,
  resetState:            React.PropTypes.func.isRequired,
  saveRefundRequest:     React.PropTypes.func.isRequired,
  saveRefundRequestData: React.PropTypes.object,
  validLookup:           React.PropTypes.func.isRequired
}

export default RefundRequest


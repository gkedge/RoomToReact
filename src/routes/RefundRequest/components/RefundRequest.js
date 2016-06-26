/* @flow */
import type {
  PdfDataType,
  RefundRequestStateObjectType,
  LookupFormDataType,
  SaveRefundRequestPayloadType
} from '../interfaces/RefundRequestTypes'
import React from 'react'
import {Box, VBox, Center, Flex, Container} from 'react-layout-components'
import PdfPanel from 'reusable/components/PdfPanel/PdfPanel'
import LookupForm from './LookupForm'
import RefundRequestForm from './RefundRequestForm'
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

export class RefundRequest extends React.Component {
  constructor(props:PropType) {
    super(props)
    this.onFileOpen               = this.onFileOpen.bind(this)
    this.onDocumentComplete       = this.onDocumentComplete.bind(this)
    this.onBinaryContentAvailable = this.onBinaryContentAvailable.bind(this)
    this.handleSubmit             = this.handleSubmit.bind(this)
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
              <RefundRequestForm {...this.props}/>
          </VBox>
        </Box>
      </section>
    )
  }
}

RefundRequest.displayName = 'RefundRequest'
RefundRequest.propTypes   = {
  loadingPdf           : React.PropTypes.func.isRequired,
  lookupFormData       : React.PropTypes.object,
  onFileOpen           : React.PropTypes.func,
  pdfBinary            : React.PropTypes.func.isRequired,
  pdfData              : React.PropTypes.object,
  pdfLoaded            : React.PropTypes.func.isRequired,
  resetState           : React.PropTypes.func.isRequired,
  saveRefundRequestData: React.PropTypes.object,
  validLookup          : React.PropTypes.func.isRequired
}

export default RefundRequest


/* @flow */
/*eslint no-useless-constructor: 0*/
import type {
  PdfDataType,
  RefundRequestFormDataType,
  LookupDataType,
  LookupFormDataType,
  MiscDataType
} from '../interfaces/RefundRequestTypes'

import React from 'react'
import {Box, VBox, Center, Flex, Container} from 'react-layout-components'
import Modal from 'react-modal'

import PdfPanel from 'reusable/components/PdfPanel/PdfPanel'
import LookupForm from './LookupForm'
import RefundRequestForm from './RefundRequestForm'
// import pick from 'lodash/pick'

type PropType = {
  loadingPdf: Function,
  lookupFormData: LookupFormDataType,
  miscData: MiscDataType,
  lookupReferencedData: Function,
  openModal: Function,
  closeModal: Function,
  pdfBinary: Function,
  pdfData: PdfDataType,
  pdfLoaded: Function,
  refundRequestFormData: RefundRequestFormDataType,
  resetState: Function,
  saveRefundRequest: Function,
  // saveRefundRequestData: SaveRefundRequestDataType,
  validLookup: Function
}

const modalStyles = {
  content: {
    top:         '10%',
    left:        '50%',
    right:       'auto',
    bottom:      'auto',
    marginRight: '-50%',
    transform:   'translate(-50%, -50%)'
  }
}

export class RefundRequest extends React.Component {
  constructor(props:PropType) {
    super(props)
    this.onFileOpen = this.onFileOpen.bind(this)
    this.onOpenModal = this.onOpenModal.bind(this)
    this.onModalRequestClose = this.onModalRequestClose.bind(this)
    this.onDocumentComplete = this.onDocumentComplete.bind(this)
    this.onBinaryContentAvailable = this.onBinaryContentAvailable.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  // componentWillReceiveProps(newProps:PropType) {
  //  console.log(JSON.stringify(newProps))
  // }

  onOpenModal() {
    this.props.openModal()
  }

  onModalRequestClose() {
    this.props.closeModal()
  }

  onFileOpen(file:Object) {
    this.props.loadingPdf(file)
  }

  onBinaryContentAvailable(pdfRaw:Uint8Array) {
    this.props.pdfBinary(pdfRaw)
  }

  onDocumentComplete() {
    this.props.pdfLoaded()
  }

  handleSubmit(data:LookupDataType) {
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
        <Modal
          isOpen={this.props.miscData.misc.isModalOpen}
          onRequestClose={this.onModalRequestClose}
          style={modalStyles} >
          I like turtles.
        </Modal>
        <Center flex='1 0 auto'>
          <button type='submit' className='btn btn-primary'
                  onClick={this.onOpenModal}>Open Modal</button>
        </Center>
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
  closeModal:            React.PropTypes.func.isRequired,
  loadingPdf:            React.PropTypes.func.isRequired,
  lookupFormData:        React.PropTypes.object,
  lookupReferencedData:  React.PropTypes.func.isRequired,
  miscData:              React.PropTypes.object.isRequired,
  openModal:             React.PropTypes.func.isRequired,
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


/* @flow */

import {connect} from 'react-redux'
import {
  lookupReferencedData,
  loadingPdf,
  pdfBinary,
  pdfLoaded,
  resetState,
  saveRefundRequest,
  validLookup
} from '../modules/RefundRequestMod'

import RefundRequest from '../components/RefundRequest'

const mapStateToProps = (state:Object):Object => ({
  pdfData: {
    pdf: state.refundRequest.pdf
  },
  lookupFormData: {
    lookupForm: state.refundRequest.lookupForm
  },
  refundRequestFormData: {
    refundRequestForm: state.refundRequest.refundRequestForm
  }
})

const mapActionCreators:{
  lookupReferencedData: Function,
  loadingPdf: Function,
  pdfBinary: Function,
  pdfLoaded: Function,
  resetState: Function,
  saveRefundRequest: Function,
  validLookup: Function
} = {
  lookupReferencedData,
  loadingPdf,
  pdfBinary,
  pdfLoaded,
  resetState,
  saveRefundRequest,
  validLookup
}

export default connect(mapStateToProps, mapActionCreators)(RefundRequest)

/* @flow */

import {connect} from 'react-redux'
import {
  validLookup,
  loadingPdf, pdfBinary, pdfLoaded,
  fetchPaymentHistory,
  saveRefundRequest,
  resetState
} from '../modules/RefundRequestMod'

import RefundRequest from '../components/RefundRequest'

const mapStateToProps = (state:Object):Object => ({
  pdfData: {
    isLoading: Boolean(state.refundRequest.isLoading),
    pdf:       state.refundRequest.pdf
  },
  lookupFormData: {
    lookup: state.refundRequest.lookup
  },
  savedRefundRequestData: {
    isSaving: Boolean(state.refundRequest.isSaving),
    isSaved:  Boolean(state.refundRequest.isSaved)
  }
})

const mapActionCreators:{
  validLookup: Function,
  loadingPdf: Function,
  pdfBinary: Function,
  pdfLoaded: Function,
  fetchPaymentHistory: Function,
  saveRefundRequest: Function,
  resetState: Function
} = {
  validLookup,
  loadingPdf,
  pdfBinary,
  pdfLoaded,
  fetchPaymentHistory,
  saveRefundRequest,
  resetState
}

export default connect(mapStateToProps, mapActionCreators)(RefundRequest)

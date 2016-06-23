/* @flow */

import {connect} from 'react-redux'
import {
  validLookup,
  loadingPdf, pdfBinary, pdfLoaded,
  fetchPaymentHistory,
  saveRefundRequest,
  resetState
} from '../modules/LoadRefundRequestMod'

import LoadRefundRequest from '../components/LoadRefundRequest'

const mapStateToProps = (state:Object):Object => ({
  pdfData: {
    isLoading: Boolean(state.loadRefundRequest.isLoading),
    pdf:       state.loadRefundRequest.pdf
  },
  lookupFormData: {
    lookup: state.loadRefundRequest.lookup
  },
  savedRefundRequestData: {
    isSaving: Boolean(state.loadRefundRequest.isSaving),
    isSaved:  Boolean(state.loadRefundRequest.isSaved)
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

export default connect(mapStateToProps, mapActionCreators)(LoadRefundRequest)

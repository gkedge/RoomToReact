/* @flow */

// import type {
//   LoadRefundRequestObject,
//   SaveRefundRequestObject
// } from '../interfaces/loadRefundRequest'

import { connect } from 'react-redux'
import { fetchRefundRequestFile, saveRefundRequest } from '../modules/LoadRefundRequestMod'

import LoadRefundRequest from '../components/LoadRefundRequest'

const mapStateToProps = (state)  => ({
  // pdf: {
  //  
  // },
  loadRefundRequestData : {
    isLoading: Boolean(state.isLoading),
    pdfContent: state.pdfContent
  },
  savedRefundRequestData: {
    isSaving: Boolean(state.isSaving),
    isSaved : Boolean(state.isSaved)
  }
})

const mapActionCreators:{
  fetchRefundRequestFile: Function,
  saveRefundRequest: Function
} = {
  fetchRefundRequestFile,
  saveRefundRequest
}

export default connect(mapStateToProps, mapActionCreators)(LoadRefundRequest)

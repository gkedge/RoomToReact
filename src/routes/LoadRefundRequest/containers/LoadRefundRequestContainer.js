/* @flow */

// import type {
//   LoadRefundRequestObject,
//   SaveRefundRequestObject
// } from '../interfaces/loadRefundRequest'

import { connect } from 'react-redux'

import { fetchRefundRequestFile, saveRefundRequest } from '../modules/LoadRefundRequestMod'

import LoadRefundRequest from '../components/LoadRefundRequest'

const mapStateToProps = (state)  => ({
  loadRefundRequestData : {
    isLoading: state.isLoading,
    pdfContent: state.pdfContent
  },
  savedRefundRequestData: {
    isSaving: state.isSaving,
    isSaved : state.isSaved
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

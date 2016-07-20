/* @flow */

import type {
  MapToObjectType
} from 'reusable/interfaces/FpngTypes'

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

const mapStateToProps = (state:Object):MapToObjectType => ({
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

// The 'pure'ity option (true by default), enlists redux to internally attempt
// optimization of React.Component.shouldcomponentupdate() via the components
// registration with Redux.connnect() below.
//
// React pure rendering functions...
// (https://facebook.github.io/react/docs/reusable-components.html#stateless-functions)
// ... require additional package support to optimize
// React.Component.shouldcomponentupdate(). It isn't as easy to programmatically
// control shouldcomponentupdate() as it is when using React.createComponent() or
// ES6 class extensions of React.Component.
//
// Until you are certain that all the app screens are updating properly,
// leave this optimization off. Within the Redux-o-verse, this optimization has
// been known to cause problems.
//
// Abramov actually recommends the 'recompose' package to serve React pure functions:
// https://github.com/acdlite/recompose#optimize-rendering-performance
const options = {
  pure: false
}

export default connect(mapStateToProps, mapActionCreators, null, options)(RefundRequest)

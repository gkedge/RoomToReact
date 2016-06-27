/* @flow */
import type {
  PdfDataType,
  RefundRequestStateObjectType,
  LookupFormDataType,
  SaveRefundRequestPayloadType
} from '../interfaces/RefundRequestTypes'

import React from 'react'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import {Box, Flex} from 'react-layout-components'
import ReactTooltip from 'react-tooltip'
import compare from 'reusable/utilities/dates'
import {upper, lower} from 'reusable/utilities/dataUtils'
import adapter, {FieldWrapper, validEmail} from 'reusable/utilities/reduxFormFieldAdapters'

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

const invalidKeyToMessageMap = {
  'bad-alpha-position'          : "Misplaced alpha character",
  'bad-alpha-position-tip'      : "Only first 2 characters can ba alphabetic",
  'bad-email-format'            : "Invalid format",
  'bad-email-format-tip'        : "Contains invalid characters or exceeds length limits",
  'bad-first-two-chars'         : "If alpha, first 2 chars alpha",
  'bad-first-two-chars-tip'     : "Alpha okay in first 2 characters, but both need to be alpha",
  'email-missing-separators'    : "Must have '@' and '.'",
  'email-missing-separators-tip': "Email have the format: <i>text</i>@<i>text</i>.<i>text</i>",
  'high-range'                  : "Must < 9 characters",
  'high-range-tip'              : "Number cannot exceed 8 characters in length",
  'less-than-data-to'           : "From is less than To",
  'less-than-data-to-tip'       : "'From' date must be greater than or equal 'To' date",
  'low-range'                   : "Must > 6 characters",
  'low-range-tip'               : "Number must at least 7 characters in length",
  'required'                    : "Required"
}

const validate = (values:LookupFormDataType):Object => {
  const errors = { lookup: {} }
  const { referenceNumX, dateFromX, dateToX, emailX } = values

  if (!referenceNumX) {
    errors.referenceNumX = 'required'
  }
  else if (referenceNumX.length < 7) {
    errors.referenceNumX = 'low-range'
  }
  else if (referenceNumX.length > 8) {
    errors.referenceNumX = 'high-range'
  }
  else if (/^(([\d][A-Za-z])|([A-Za-z][\d])).*/.test(referenceNumX)) {
    errors.referenceNumX = 'bad-first-two-chars'
  }
  else if (!/^[A-Za-z\d][A-Za-z\d]\d*$/.test(referenceNumX)) {
    errors.referenceNumX = 'bad-alpha-position'
  }
  if (!dateFromX) {
    errors.dateFromX = 'required'
  }
  if (!dateToX) {
    errors.dateToX = 'required'
  }
  if (dateFromX && dateToX) {
    const diff = compare(dateFromX, dateToX)
    if (diff > 0) {
      errors.dateFromX = 'less-than-data-to'
      errors.dateToX   = 'less-than-data-to'
    }
  }
  if (emailX) {
    if (!(/\S*@\S*\./).test(emailX)) {
      errors.email = 'email-missing-separators'
    }
    else if (!validEmail.test(emailX)) {
      errors.email = 'bad-email-format'
    }
  }
  return errors
}

const renderReferenceNum = (fieldProps:Object):?Object => {
  // <img href='circle-questionmark.jpg' />
  const info = '<ul style="list-style: none; margin: 0; padding: 0">' +
               '<li>Number must be 7 or 8 characters in length</li>' +
               '<li><label>Format:</label></li>' +
               '<ul>' +
               '<li>Numbers (0-9)</li>' +
               '<li>First two characters may be alphabetic</li>' +
               '<li>If any alphabetic, there must be two</li>' +
               '</ul>' +
               '<li><label style="padding-top: 1rem">E.g.:</label></li>' +
               '<ul style="padding-bottom: 0">' +
               '<li style="font-family: monospace;">06152000</li>' +
               '<li style="font-family: monospace;">BD032403</li>' +
               '<li style="font-family: monospace;">0123456</li>' +
               '</ul>' +
               '</ul>'
  return (
    <div className={fieldProps.name + '-field form-field'}>
      <div>
        <Flex justifyContent='space-between'>
          <label className={fieldProps.name + '-label'}
                 htmlFor={fieldProps.id ? fieldProps.id
                  : fieldProps.name + '-input'}>Reference #</label>
          <label className='questionmark'
                 data-html='true'
                 data-tip={info}>[&#x2753;]</label>
          <ReactTooltip />
        </Flex>
      </div>
      {FieldWrapper(fieldProps)}
    </div>)
}

export class RefundRequestForm extends React.Component {

  constructor(props:PropType) {
    super(props)
  }

  // TODO: normalize API not published yet in redux-form@6.0.0-alpha-15

  // WARNING: the 'component' property on <Field /> CANNOT be a '=>'
  // function! It will cause a re-render of the Field component every time.
  // Though the performance hit may be insignificant, it causes loss of focus
  // on HTML <input /> fields after entering the 1st charater into the <input />.
  render() {
    return (
        <section className='request-section'>
          <form onSubmit={this.props.handleSubmit} className='request-form'>
            <Box justify-content='center'>
              <Field name='referenceNumX' id='referenceNum-id'
                     messageMap={invalidKeyToMessageMap}
                     normalize={upper} component={renderReferenceNum}/>
    
              <div className='date-range form-field'>
                <div>
                  <label>Mailroom Date Range</label>
                </div>
                <Flex className='mailroom-date'>
                  <Field name='dateFromX' placeholder='From'
                         visitedType='date' messageMap={invalidKeyToMessageMap}
                         normalize={lower} component={FieldWrapper}/>
                  <Field name='dateToX' placeholder='To'
                         visitedType='date' messageMap={invalidKeyToMessageMap}
                         normalize={lower} component={FieldWrapper}/>
                </Flex>
              </div>
    
              <Field name='emailX' label='Email Address'
                     messageMap={invalidKeyToMessageMap}
                     normalize={lower} component={FieldWrapper}/>
    
              { /*
               Adapter doesn't work for some reason.
               <Field name='email' label="Email Address"
               messageMap={invalidKeyToMessageMap}
               normalize={lower} component='EmailAdapter' />
               */}
    
              <div className='lookup-btnsX form-field'>
                <br/>
                <button type='submit' className='btn btn-primary'
                        disable={this.props.submitting}>Search
                </button>
              </div>
            </Box>
          </form>
        </section>
    )
  }
}

RefundRequestForm.displayName = 'RefundRequest'
RefundRequestForm.propTypes   = {
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

RefundRequestForm = reduxForm(
  {
    form: 'lookupForm',
    adapter,
    validate
  }
)(RefundRequestForm)

RefundRequestForm = connect(
  (state:Object):Object => ({
    // pull initial values from refundRequest
    initialValues: state.refundRequest.lookup
  })
)(RefundRequestForm)

export default RefundRequestForm
export default RefundRequestForm

/* @flow */

import type {LookupFormDataType} from '../interfaces/LoadRefundRequestTypes'

type PropType = {
  lookup: LookupFormDataType,
  form: string,
  anyTouched: boolean,
  dirty: boolean,
  initialized: boolean,
  invalid: boolean,
  pristine: boolean,
  submitting: boolean,
  submitFailed: boolean,
  valid: boolean,
  array: Object,
  handleSubmit: Function
}

import React from 'react'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import {Box, Flex} from 'react-layout-components'
import ReactTooltip from 'react-tooltip'
import compare from 'reusable/utilities/dates'
import {upper, lower} from 'reusable/utilities/dataUtils'
import adapter, {FieldWrapper, validEmail} from 'reusable/utilities/reduxFormFieldAdapters'

// import {load as initialValues} from '../modules/LoadRefundRequestMod'
import classes from './LookupForm.scss'

const invalidKeyToMessageMap = {
  'bad-alpha-position':           "Misplaced alpha character",
  'bad-alpha-position-tip':       "Only first 2 characters can ba alphabetic",
  'bad-email-format':             "Invalid format",
  'bad-email-format-tip':         "Contains invalid characters or exceeds length limits",
  'bad-first-two-chars':          "If alpha, first 2 chars alpha",
  'bad-first-two-chars-tip':      "Alpha okay in first 2 characters, but both need to be alpha",
  'email-missing-separators':     "Must have '@' and '.'",
  'email-missing-separators-tip': "Email have the format: <i>text</i>@<i>text</i>.<i>text</i>",
  'high-range':                   "Must < 9 characters",
  'high-range-tip':               "Number cannot exceed 8 characters in length",
  'less-than-data-to':            "From is less than To",
  'less-than-data-to-tip':        "'From' date must be greater than or equal 'To' date",
  'low-range':                    "Must > 6 characters",
  'low-range-tip':                "Number must at least 7 characters in length",
  'required':                     "Required"
}

const validate = (values:LookupFormDataType):Object => {
  const errors = {lookup: {}}
  const {referenceNum, dateFrom, dateTo, email} = values

  if (!referenceNum) {
    errors.referenceNum = 'required'
  }
  else if (referenceNum.length < 7) {
    errors.referenceNum = 'low-range'
  }
  else if (referenceNum.length > 8) {
    errors.referenceNum = 'high-range'
  }
  else if (/^(([\d][A-Za-z])|([A-Za-z][\d])).*/.test(referenceNum)) {
    errors.referenceNum = 'bad-first-two-chars'
  }
  else if (!/^[A-Za-z\d][A-Za-z\d]\d*$/.test(referenceNum)) {
    errors.referenceNum = 'bad-alpha-position'
  }
  if (!dateFrom) {
    errors.dateFrom = 'required'
  }
  if (!dateTo) {
    errors.dateTo = 'required'
  }
  if (dateFrom && dateTo) {
    const diff = compare(dateFrom, dateTo)
    if (diff > 0) {
      errors.dateFrom = 'less-than-data-to'
      errors.dateTo = 'less-than-data-to'
    }
  }
  if (email) {
    if (!(/\S*@\S*\./).test(email)) {
      errors.email = 'email-missing-separators'
    }
    else if (!validEmail.test(email)) {
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

let LookupForm = (props:PropType):Object => {
  const {handleSubmit, submitting} = props
  // TODO: normalize API not published yet in redux-form@6.0.0-alpha-15

  // WARNING: the 'component' property on <Field /> CANNOT be a '=>'
  // function! It will cause a re-render of the Field component every time.
  // Though the performance hit may be insignificant, it causes loss of focus
  // on HTML <input /> fields after entering the 1st charater into the <input />.
  return (
    <section className='lookup-section' key='lookup-section'>
      <form onSubmit={handleSubmit} className='lookup-form' key='lookup-form-form'>
        <Box justify-content='center' key='lookup-form-layout'>
          <Field name='referenceNum' id='referenceNum-id'
                 messageMap={invalidKeyToMessageMap}
                 normalize={upper} component={renderReferenceNum}/>

          <div className='date-range form-field'>
            <div>
              <label>Mailroom Date Range</label>
            </div>
            <Flex className='mailroom-date'>
              <Field name='dateFrom' placeholder='From'
                     visitedType='date' messageMap={invalidKeyToMessageMap}
                     normalize={lower} component={FieldWrapper}/>
              <Field name='dateTo' placeholder='To'
                     visitedType='date' messageMap={invalidKeyToMessageMap}
                     normalize={lower} component={FieldWrapper}/>
            </Flex>
          </div>

          <Field name='email' label='Email Address'
                 messageMap={invalidKeyToMessageMap}
                 normalize={lower} component={FieldWrapper}/>

          { /* Adapter doesn't work for some reason.
           <Field name='email' label="Email Address"
           messageMap={invalidKeyToMessageMap}
           normalize={lower} component='EmailAdapter' />
           */ }

          <div className='lookup-btns form-field' key='lookup-submit-layout'>
            <br key='lookup-submit-spacer'/>
            <button type='submit'
                    className='btn btn-primary'
                    key='lookup-submit'
                    disable={submitting}>Search
            </button>
          </div>
        </Box>
      </form>
    </section>
  )
}

LookupForm.displayName = 'LookupForm'
LookupForm.propTypes = {
  anyTouched:   React.PropTypes.bool.isRequired,
  array:        React.PropTypes.object.isRequired,
  dirty:        React.PropTypes.bool.isRequired,
  form:         React.PropTypes.string.isRequired,
  handleSubmit: React.PropTypes.func.isRequired,
  initialized:  React.PropTypes.bool.isRequired,
  invalid:      React.PropTypes.bool.isRequired,
  lookup:       React.PropTypes.object.isRequired,
  pristine:     React.PropTypes.bool.isRequired,
  submitFailed: React.PropTypes.bool.isRequired,
  submitting:   React.PropTypes.bool.isRequired,
  valid:        React.PropTypes.bool.isRequired
}

LookupForm = reduxForm(
  {
    form: 'lookupForm',
    adapter,
    validate
  }
)(LookupForm)

LookupForm = connect(
  (state:Object):Object => ({
    // pull initial values from loadRefundRequest
    initialValues: state.loadRefundRequest.lookup
  })
)(LookupForm)

export default LookupForm

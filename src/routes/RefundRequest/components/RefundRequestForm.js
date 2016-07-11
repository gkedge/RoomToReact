/* @flow */
import type {RefundRequestFormDataType} from '../interfaces/RefundRequestTypes'

import React from 'react'
import {connect} from 'react-redux'
import {reduxForm, Field} from 'redux-form'
import {Box, Flex} from 'react-layout-components'
import ReactTooltip from 'react-tooltip'
import compare from 'reusable/utilities/dates'
import {upper, lower} from 'reusable/utilities/dataUtils'
import adapter, {FieldWrapper, validEmail} from 'reusable/utilities/reduxFormFieldAdapters'

type PropType = {
  anyTouched: boolean,
  array: Object,
  dirty: boolean,
  form: string,
  handleSubmit: Function,
  initialized: boolean,
  invalid: boolean,
  pristine: boolean,
  refundRequestForm: RefundRequestFormDataType,
  submitFailed: boolean,
  submitting: boolean,
  valid: boolean,
}

const invalidKeyToMessageMap = {
}

const validate = (values:RefundRequestFormDataType):Object => {
  const errors = {lookup: {}}
  return errors
}

let RefundRequestForm = (props:PropType):Object => {
  const {handleSubmit, submitting} = props

  // TODO: normalize API not published yet in redux-form@6.0.0-alpha-15

  // WARNING: the 'component' property on <Field /> CANNOT be a '=>'
  // function! It will cause a re-render of the Field component every time.
  // Though the performance hit may be insignificant, it causes loss of focus
  // on HTML <input /> fields after entering the 1st charater into the <input />.
  return (
    <section className='request-section'>
      <form onSubmit={handleSubmit} className='request-form'>
        <Box justify-content='center'>
          <span>Yow!</span>
          { /*
           Adapter doesn't work for some reason.
           <Field name='email' label="Email Address"
           messageMap={invalidKeyToMessageMap}
           normalize={lower} component='EmailAdapter' />
           */}

          <div className='lookup-btnsX form-field'>
            <br/>
            <button type='submit' className='btn btn-primary'
                    disable={submitting}>Search
            </button>
          </div>
        </Box>
      </form>
    </section>)
}

RefundRequestForm.displayName = 'RefundRequestForm'
RefundRequestForm.propTypes = {
  anyTouched:        React.PropTypes.bool.isRequired,
  array:             React.PropTypes.object.isRequired,
  dirty:             React.PropTypes.bool.isRequired,
  form:              React.PropTypes.string.isRequired,
  handleSubmit:      React.PropTypes.func.isRequired,
  initialized:       React.PropTypes.bool.isRequired,
  invalid:           React.PropTypes.bool.isRequired,
  pristine:          React.PropTypes.bool.isRequired,
  refundRequestForm: React.PropTypes.object.isRequired,
  submitFailed:      React.PropTypes.bool.isRequired,
  submitting:        React.PropTypes.bool.isRequired,
  valid:             React.PropTypes.bool.isRequired
}

RefundRequestForm = reduxForm(
  {
    form: 'refundRequestForm',
    // adapter,
    validate
  }
)(RefundRequestForm)

RefundRequestForm = connect(
  (state:Object):Object => ({
    // pull initial values from refundRequest
    initialValues: state.refundRequest.refundRequestForm
  })
)(RefundRequestForm)

export default RefundRequestForm

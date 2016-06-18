/* @flow */

import React from 'react'
import {connect} from 'react-redux'
import {reduxForm, formValueSelector, Field} from 'redux-form'
// import {load as initialValues} from '../modules/LoadRefundRequestMod'
import classes from './LookupForm.scss'

import type {LookupFormData} from '../interfaces/LoadRefundRequestTypes'

type Props = {
  lookup: LookupFormData,
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

const validate = values => {
  const errors = {}
  if (!values.lookup.referenceNum) {
    errors.referenceNum = 'Required'
  }
  return errors
}

let LookupForm = (props:Props) => {
  const {handleSubmit, submitting} = props

  return (
    <section className='right-half'>
      <form onSubmit={handleSubmit}>
        <div className='lookup'>
          <Field
            name='lookup.referenceNum'
            component={referenceNum =>
              <div className='reference-num form-field'>
                <div className=''>
                  <label>Reference #</label>
                </div>
                <div className=''>
                  <input type='text' {...referenceNum} />
                  {referenceNum.touched && referenceNum.error &&
                    <span className='error'>{referenceNum.error}</span>}
                </div>
              </div>}
          />
          <div className='date-range form-field'>
            <div className=''>
              <label>Mailroom Date Range</label>
            </div>
            <div className='flex-container'>
              <Field
                name='lookup.dateFrom'
                component={dateFrom =>
                  <div className='dateFrom-field'>
                    <input type={dateFrom.visited ? 'date' : 'text'}
                      placeholder='From' {...dateFrom} />
                    {dateFrom.visited && dateFrom.error &&
                      <span className='error'>{dateFrom.error}</span>}
                  </div>}
              />
              <Field
                name='lookup.dateTo'
                component={dateTo =>
                  <div className='dateTo-field'>
                    <input type={dateTo.visited ? 'date' : 'text'}
                      placeholder='To' {...dateTo} />
                    {dateTo.visited && dateTo.error &&
                      <span className='error'>{dateTo.error}</span>}
                  </div>}
              />
            </div>
          </div>
          <Field
            name='lookup.email'
            component={email =>
              <div className='email form-field'>
                <div className=''>
                  <label>Email Address</label>
                </div>
                <div className=''>
                  <input type='email' {...email} />
                  {email.visited && email.error &&
                    <span className='error'>{email.error}</span>}
                </div>
              </div>}
          />

          <div className='lookup-btns form-field'>
            <br />
            <button type='submit' className='btn btn-primary' disable={submitting}>Search</button>
          </div>
        </div>
      </form>
    </section>
  )
}

LookupForm.propTypes = {
  lookup:       React.PropTypes.object.isRequired,
  form:         React.PropTypes.string.isRequired,
  anyTouched:   React.PropTypes.bool.isRequired,
  dirty:        React.PropTypes.bool.isRequired,
  initialized:  React.PropTypes.bool.isRequired,
  invalid:      React.PropTypes.bool.isRequired,
  pristine:     React.PropTypes.bool.isRequired,
  submitting:   React.PropTypes.bool.isRequired,
  submitFailed: React.PropTypes.bool.isRequired,
  valid:        React.PropTypes.bool.isRequired,
  array:        React.PropTypes.object.isRequired,
  handleSubmit: React.PropTypes.func.isRequired
}

LookupForm = reduxForm(
  {
    form: 'lookupForm',
    validate
  }
)(LookupForm)

LookupForm = connect(
  state => ({
    // pull initial values from loadRefundRequest
    initialValues: state.loadRefundRequest
  })
)(LookupForm)

// const selector = formValueSelector('lookupForm') // <-- same as form name
//
// LookupForm = connect(
//  state => {
//    const {referenceNum, dateFrom, dateTo} =
//            selector(state, 'referenceNum', 'dateFrom', 'dateTo')
//    return {
//      referenceNum, dateFrom, dateTo
//    }
//  }
// )(LookupForm)
export default LookupForm
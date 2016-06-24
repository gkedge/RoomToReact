/* @flow */
import React from 'react'
import {Box, Flex} from 'react-layout-components'
import ReactTooltip from 'react-tooltip'
import Transition from 'react-motion-ui-pack'

/*
 Refunds uses [`redux-form`](http://redux-form.com) to manage the form
 state of a set of user input to be submitted. Contains a set of field
 `reduxFormFieldAdapter.js` contains reusable field adapters that group a
 label, the input field and a span for showing to a user if the field is
 invalid. The span can be tooltipped to provide more information than the
 terse span may contain. Per 508c compliance, labels are linked up with
 the input fields they label.
 */
export const validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i

const invalidMsg = (fieldProps:Object):Object => {
  const {name, error, messageMap} = fieldProps
  const errMsg = messageMap[error] || error
  const errMsgTip = messageMap[error + '-tip'] || null
  return (
    <div className='invalid'>
      {/* Ease in error message */}
      <Transition component='span'>
        <span className='invalid'
              data-html='true'
              data-tip={errMsgTip}
              key={name + '-invalid-msg'}> {errMsg} </span>
        {/*
         ReactTooltip rakes in the data-html & data-tip from <span>
         above. If no data-tip, ReactTooltip will safely not activate.
         */}
        <ReactTooltip key={name + '-invalid-tooltip'}/>
      </ Transition >
    </div>
  )
}
invalidMsg.propTypes = {
  error:      React.PropTypes.string.isRequired,
  messageMap: React.PropTypes.object.isRequired,
  name:       React.PropTypes.string.isRequired
}

const renderInputLabel = (fieldProps:Object):Object => {
  const {name, id, label} = fieldProps
  return (
    <div>
      <label forHtml={id || name + '-input'}>{label}</label>
    </div>)
}
renderInputLabel.propTypes = {
  id:    React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  name:  React.PropTypes.string.isRequired
}

export const FieldWrapper = (fieldProps:Object):Object => {
  const {
          name, id, type, placeholder, label,
          visited, visitedType,
          touched, error
        } = fieldProps

  const inputType = visited ? (visitedType || type || 'text') : type || 'text'

  return (
    <div className={name + '-field form-field'}>
      {label && renderInputLabel(fieldProps)}
      <div>
        <input type={inputType} {...fieldProps}
               id={id || name + '-input'}
               placeholder={placeholder}/>
        {touched && error && invalidMsg(fieldProps)}
      </div>
    </div>)
}

const adapters = {

  TextAdapter: (fieldProps:Object):Object =>
                 <FieldWrapper {...fieldProps} />,

  EmailAdapter: (fieldProps:Object):Object =>
                  <FieldWrapper {...fieldProps} type='email'/>,

  PasswordAdapter: (fieldProps:Object):Object =>
                     <FieldWrapper {...fieldProps} type='password '/>,

  NumberAdapter: (fieldProps:Object):Object =>
                   <FieldWrapper {...fieldProps} type='number '/>,

  DateAdapter: (fieldProps:Object):Object =>
                 <FieldWrapper {...fieldProps} type='date'/>,

  PlaceholderDateAdapter: (fieldProps:Object):Object =>
                            <FieldWrapper visitedType='date' {...fieldProps} />
}

const adapter = (key:string, props:Object):Function => {
  const adapter = adapters[key]
  if (adapter) {
    return adapter(props)
  }
}
adapter.propTypes = {
  key:   React.PropTypes.string.isRequired,
  props: React.PropTypes.object.isRequired
}

export default adapter

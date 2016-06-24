/* @flow */
import React from 'react'
import {Box, Flex} from 'react-layout-components'
import ReactTooltip from 'react-tooltip'
import Transition from 'react-motion-ui-pack'

const invalidMsg = ({name, error, messageMap}):Object => {
  const errMsg    = messageMap[error] || error
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

const renderInputLabel = ({name, id, label}):Object => {
  return (
    <div>
      <label forHtml={id ? id : name + '-input'}>{label}</label>
    </div>)
}

export const FieldWrapper = (fieldProps:Object):Object => {
  const {
          name, id, type, placeholder, label,
          visited, visitedType, 
          touched, error
        } = fieldProps
  
  const inputType = visited ? visitedType ? visitedType :
                              type ? type : 'text' :
                    type ? type : 'text'

  return (
    <div className={name + '-field form-field'}>
      {label && renderInputLabel(fieldProps)}
      <div>
        <input type={inputType} {...fieldProps}
               id={id ? id : name + '-input' }
               placeholder={placeholder} />
        {touched && error && invalidMsg(fieldProps)}
      </div>
    </div>)
}

const adapters = {

  TextAdapter: fieldProps => <FieldWrapper {...fieldProps} />,

  EmailAdapter: fieldProps => <FieldWrapper {...fieldProps} type='email' />,

  PasswordAdapter: fieldProps => <FieldWrapper {...fieldProps} type='password' />,

  NumberAdapter: fieldProps => <FieldWrapper {...fieldProps} type='number' />,

  DateAdapter: fieldProps => <FieldWrapper {...fieldProps} type='date' />,

  PlaceholderDateAdapter: fieldProps => 
    <FieldWrapper visitedType='date' visitedType='text' {...fieldProps} />

}

const adapter = (key, props):Function => {
  const adapter = adapters[key]
  if (adapter) {
    return adapter(props)
  }
}
export const validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
export default adapter

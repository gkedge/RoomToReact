/* @flow */
import SweetAlert from 'sweetalert-react'
import React from 'react'

import type {
  SystemErrorStylesType,
  TimeStampedSystemErrorReportsType
} from './SystemErrorTypes'

type PropType = {
  sysErrReports: TimeStampedSystemErrorReportsType,
  isShowSystemError: boolean,
  onModalRequestClose: Function
}

const defaultSystemErrorStyles = {
  content: {
    top:         '10%',
    left:        '50%',
    right:       'auto',
    bottom:      'auto',
    marginRight: '-50%',
    transform:   'translate(-50%, -50%)'
  }
}

export default class SystemError extends React.Component {
  constructor(props:PropType) {
    super(props)
    this.onAfterOpen = this.onAfterOpen.bind(this)
    this.onModalRequestClose = this.onModalRequestClose.bind(this)
  }

  onModalRequestClose() {
    this.props.onModalRequestClose && this.props.onModalRequestClose()
  }

  onAfterOpen() {
    this.props.onAfterOpen && this.props.onAfterOpen()
  }

  render():Object {
    return (
      <section className='system-error'>
        <SweetAlert
          show={this.props.isShowSystemError}
          title="Demo Complex"
          type="success"
          text="SweetAlert in React"
          showCancelButton={true}
          onConfirm={() => {
            console.log('confirm'); // eslint-disable-line no-console
            this.onModalRequestClose()
          }}
          onCancel={() => {
            console.log('cancel'); // eslint-disable-line no-console
            this.onModalRequestClose()
          }}
         
          onEscapeKey={() => this.onModalRequestClose()}
          onOutsideClick={() => this.onModalRequestClose()}
        />
      </section>)
  }
}

SystemError.displayName = 'SystemError'
SystemError.propTypes = {
  sysErrReports: React.PropTypes.array,
  isShowSystemError: React.PropTypes.bool.isRequired,
  onModalRequestClose: React.PropTypes.func.isRequired

  // goToLogin:       React.PropTypes.func.isRequired,
}


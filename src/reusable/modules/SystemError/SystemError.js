/* @flow */
import SweetAlert from 'sweetalert-react'
import React from 'react'

import type {
  SystemErrorStylesType,
  TimeStampedSystemErrorReportsType
} from './SystemErrorTypes'

type PropType = {
  isShowSystemError: boolean,
  closeTimeoutMS: ?number,
  systemErrorStyles: ?SystemErrorStylesType,
  onAfterOpen: ?Function,
  onModalRequestClose: Function,
  sysErrReports: TimeStampedSystemErrorReportsType,
  children: string
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
          show={this.props.show}
          title="Demo"
          text="SweetAlert in React"
          timer={this.props.closeTimeoutMS}
          onConfirm={this.onModalRequestClose}
        />
      </section>)
  }
}

SystemError.displayName = 'SystemError'
SystemError.propTypes = {
  children:            React.PropTypes.string,
  closeTimeoutMS:      React.PropTypes.number,
  isShowSystemError:   React.PropTypes.bool.isRequired,
  onAfterOpen:         React.PropTypes.func,
  onModalRequestClose: React.PropTypes.func.isRequired,
  sysErrReports:       React.PropTypes.array.isRequired,
  systemErrorStyles:   React.PropTypes.object
}


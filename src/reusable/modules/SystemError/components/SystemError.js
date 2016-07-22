/* @flow */
import Modal from 'react-modal'
import React from 'react'

type PropType = {
  openModal: Function,
  closeModal: Function,
}

const modalStyles = {
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
    this.onOpenModal         = this.onOpenModal.bind(this)
    this.onModalRequestClose = this.onModalRequestClose.bind(this)
  }

  onOpenModal() {
    this.props.openModal()
  }

  onModalRequestClose() {
    this.props.closeModal()
  }

  /* isOpen={this.props.miscData.misc.isModalOpen} */

  render():Object {
    return (
      <section className='system-error'>
        <Modal
          isOpen={true}
          onRequestClose={this.onModalRequestClose}
          style={modalStyles}>
          I like turtles.
        </Modal>
      </section>)
  }
}


/* flow */

import React from 'react'
import PdfViewer from 'reusable/components/PdfViewer/PdfViewer'

type Props = {
  isLoading: boolean,
  file: ?any,
  content: ?string,
  binaryContent: ?Uint8Array,
  page: ?number,
  scale: ?number,
  onFileOpen: ?Function,
  onBinaryContentAvailable: ?Function,
  onDocumentComplete: ?Function,
}

export default class PdfPanel extends React.Component {

  constructor(props:Props) {
    super(props)
    this.onBinaryContentAvailable = this.onBinaryContentAvailable.bind(this)
    this.onFileOpen = this.onFileOpen.bind(this)
    this.onDocumentComplete = this.onDocumentComplete.bind(this)
  }

  onBinaryContentAvailable(pdfRaw) {
    if (this.props.onBinaryContentAvailable) {
      this.props.onBinaryContentAvailable(pdfRaw)
    }
  }

  onDocumentComplete() {
    if (this.props.onDocumentComplete) {
      this.props.onDocumentComplete()
    }
  }

  onFileOpen() {
    if (this.props.onFileOpen) {
      let input = document.getElementById('fileinput')
      let file = input && input.files.length > 0 ? input.files[0] : null
      this.props.onFileOpen(file)
    }
  }

  render() {
    const isPDF = this.props.file || this.props.content || this.props.binaryContent

    if (isPDF) {
      return (
        <div className='left-half'>
          <div className='pdf-panel flex-container'>
            <PdfViewer { ...this.props }
              onDocumentComplete={this.onDocumentComplete}
              onBinaryContentAvailable={this.onBinaryContentAvailable} />
          </div>
        </div>
      )
    } else {
      return (
        <div className='left-half'>
          <div className='scan-upload-btns-panel flex-container'>
            <div className='scan-upload-btns-flex' >
              <div className='scan-upload-btns' >
                <button className='scan-btn btn'>Scan Document</button>
                <div className='attach-document btn btn-primary'>
                  <span>Attach Document</span>
                  <input type='file' id='fileinput'
                         className='attach-btn btn'
                         accept='application/pdf'
                         onChange={this.onFileOpen}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

PdfPanel.propTypes = {
  isLoading:                React.PropTypes.bool,
  file:                     React.PropTypes.any,
  content:                  React.PropTypes.string,
  binaryContent:            React.PropTypes.object,
  page:                     React.PropTypes.number,
  scale:                    React.PropTypes.number,
  onFileOpen:               React.PropTypes.func,
  onBinaryContentAvailable: React.PropTypes.func
}

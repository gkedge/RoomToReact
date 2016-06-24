/* flow */

import React from 'react'
import {Center} from 'react-layout-components'
import PdfViewer from 'reusable/components/PdfViewer/PdfViewer'

type PropType = {
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

  constructor(props:PropType) {
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
        <div className='pdf-panel'>
          <PdfViewer {...this.props}
            onDocumentComplete={this.onDocumentComplete}
            onBinaryContentAvailable={this.onBinaryContentAvailable}/>
        </div>
      )
    }
    else {
      return (
        <div className='scan-upload-btns-panel'>
          <div className='scan-upload-btns-outer'>
            <Center className='scan-upload-btns'>
              <button className='scan-btn btn'>Scan Document</button>
              <div className='attach-document btn btn-primary'>
                <span>Attach Document</span>
                <input type='file' id='fileinput'
                       className='attach-btn btn'
                       accept='application/pdf'
                       onChange={this.onFileOpen}/>
              </div>
            </Center>
          </div>
        </div>
      )
    }
  }
}
PdfPanel.displayName = 'PdfPanel'
PdfPanel.propTypes = {
  binaryContent:            React.PropTypes.object,
  content:                  React.PropTypes.string,
  file:                     React.PropTypes.any,
  isLoading:                React.PropTypes.bool,
  onBinaryContentAvailable: React.PropTypes.func,
  onFileOpen:               React.PropTypes.func,
  page:                     React.PropTypes.number,
  scale:                    React.PropTypes.number
}

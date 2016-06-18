/* flow */
import React from 'react'
import PDF from 'react-pdf-js'

type Props = {
  isLoading: boolean,
  file: ?any,
  content: ?string,
  binaryContent: ?Uint8Array,
  page: ?number,
  scale: ?number,
  onContentAvailable: ?Function,
  onDocumentComplete: ?Function,
  onBinaryContentAvailable: ?Function
}

class PdfViewer extends React.Component {
  constructor(props:Props) {
    super(props)
    this.onDocumentComplete = this.onDocumentComplete.bind(this)
    this.onPageCompleted = this.onPageCompleted.bind(this)
    this.handlePrevious = this.handlePrevious.bind(this)
    this.handleNext = this.handleNext.bind(this)
  }

  onDocumentComplete(pages) {
    this.setState({page: 1, pages})
    if (this.props.onDocumentComplete) {
      this.props.onDocumentComplete()
    }
  }

  onPageCompleted(page) {
    this.setState({page})
  }

  handlePrevious() {
    this.setState({page: this.state.page - 1})
  }

  handleNext() {
    this.setState({page: this.state.page + 1})
  }

  renderPagination(page, pages) {
    let previousButton =
      <li className='previous' onClick={this.handlePrevious}>
        <a href='#'>
          <i className='fa fa-arrow-left' />
          Previous
        </a>
      </li>

    let nextButton =
      <li className='next' onClick={this.handleNext}>
        <a href='#'>
          Next
          <i className='fa fa-arrow-right' />
        </a>
      </li>

    if (page === 1) {
      previousButton =
        <li className='previous disabled' onClick={this.handlePrevious}>
          <a href='#'>
            <i className='fa fa-arrow-left' />
            Previous
          </a>
        </li>
    }

    if (page === pages) {
      nextButton =
        <li className='next disabled' onClick={this.handleNext}>
          <a href='#'>
            Next
            <i className='fa fa-arrow-right' />
          </a>
        </li>
    }
    return (
      <nav>
        <ul className='pager'>
          {previousButton}
          {nextButton}
        </ul>
      </nav>
    )
  }

  render() {
    let pagination = null
    if ((this.state || {}).pages) {
      pagination = this.renderPagination(this.state.page, this.state.pages)
    }
    return (
      <div className='pdf-viewer'>
        <PDF file={this.props.file}
             content={this.props.content}
             binaryContent={this.props.binaryContent}
             scale={this.props.scale ? this.props.scale : 1.0}
             onDocumentComplete={this.onDocumentComplete}
             onPageCompleted={this.onPageCompleted}
             onBinaryContentAvailable={this.props.onBinaryContentAvailable}
             onContentAvailable={this.props.onContentAvailable}
             page={(this.state || {}).page}/>
        {pagination}
      </div>
    )
  }
}

PdfViewer.propTypes = {
  isLoading:                React.PropTypes.bool,
  file:                     React.PropTypes.any,
  content:                  React.PropTypes.string,
  binaryContent:            React.PropTypes.object,
  page:                     React.PropTypes.number,
  scale:                    React.PropTypes.number,
  onContentAvailable:       React.PropTypes.func,
  onBinaryContentAvailable: React.PropTypes.func,
  onDocumentComplete:       React.PropTypes.func
}

module.exports = PdfViewer
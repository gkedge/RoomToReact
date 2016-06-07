import React from 'react'
import Pdf from 'components/Pdf/Pdf'
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

const props = {
  pdfData: {
    isLoading: false,
    file: null,
    content: null,
    page: 0,
    scale: 1.0,
    onDocumentComplete : sinon.spy(),
    onPageComplete: sinon.spy()
  },
  loadRefundRequestData: {
    isLoading: false,
    pdfContent: null
  },
  saveRefundRequestData: {
    isSaving: false,
    isSaved: false
  },
  fetchRefundRequestFile : sinon.spy(),
  saveRefundRequest: sinon.spy()
}

describe('(Component) Pdf', () => {
  it('should exist', () => {
    expect(Pdf).to.not.be.null
  })
  
  it('allows us to set props', () => {
    //sinon.spy(Pdf.prototype, 'componentDidMount');
    const wrapper = mount(<Pdf {...props.pdfData} />)
    //expect(Pdf.prototype.componentDidMount.calledOnce).to.be.true
    expect(wrapper.props().isLoading).to.be.false
    // wrapper.setProps({ pdf: { pdf:  { id: 0, value: 'Yowsa' }  })
    expect(wrapper.props().content).to.be.null
  })

  // it('Simulate wisdom', () => {
  //   const wrapper = shallow(<Pdf {...props} />)
  //   wrapper.find('.wisdom').simulate('click')
  //   expect(initialProps.fetchZen.calledOnce).to.be.true
  // })
  //
  // it('Simulate save', () => {
  //   const wrapper = shallow(<Pdf {...props} />)
  //   wrapper.find('.save').simulate('click')
  //   expect(initialProps.saveCurrentZen.calledOnce).to.be.true
  // })
  //
  // it('List populated', () => {
  //   const wrapper = shallow(<Pdf {...props} />)
  //   wrapper.find('li').forEach(function (node) {
  //     expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
  //   })
  // })
})

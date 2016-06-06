import React from 'react'
import Pdf from 'components/Pdf/Pdf'
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

const props = {
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
    const wrapper = mount(<Pdf {...props} />)
    //expect(Pdf.prototype.componentDidMount.calledOnce).to.be.true
    expect(wrapper.props().pdf.value).to.equal('Yow')
    // wrapper.setProps({ pdf: { pdf:  { id: 0, value: 'Yowsa' }  })
    expect(wrapper.props().pdf.value).to.equal('Yowsa')
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

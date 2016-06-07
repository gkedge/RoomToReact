import React from 'react'
import LoadRefundRequest from 'routes/LoadRefundRequest/components/LoadRefundRequest'
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


describe('(Component) LoadRefundRequest', () => {
  it('should exist', () => {
    expect(LoadRefundRequest).to.not.be.null
  })

  it('allows us to set props', () => {
    //sinon.spy(LoadRefundRequest.prototype, 'componentDidMount');
    const wrapper = mount(<LoadRefundRequest {...props} />)
    //expect(LoadRefundRequest.prototype.componentDidMount.calledOnce).to.be.true
    expect(wrapper.props().loadRefundRequestData.isLoading).to.be.false
    // wrapper.setProps({ loadRefundRequest: { loadRefundRequest:  { id: 0, value: 'Yowsa' }  });
    expect(wrapper.props().loadRefundRequestData.pdfContent).to.be.null
  })

  // it('Simulate wisdom', () => {
  //   const wrapper = shallow(<LoadRefundRequest {...props} />)
  //   wrapper.find('.wisdom').simulate('click')
  //   expect(initialProps.fetchZen.calledOnce).to.be.true
  // })
  //
  // it('Simulate save', () => {
  //   const wrapper = shallow(<LoadRefundRequest {...props} />)
  //   wrapper.find('.save').simulate('click')
  //   expect(initialProps.saveCurrentZen.calledOnce).to.be.true
  // })
  //
  // it('List populated', () => {
  //   const wrapper = shallow(<LoadRefundRequest {...props} />)
  //   wrapper.find('li').forEach(function (node) {
  //     expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
  //   })
  // })
})

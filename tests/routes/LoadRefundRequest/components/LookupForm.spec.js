import React from 'react'
import {LookupForm} from 'routes/LoadRefundRequest/components/LookupForm'
import sinon from 'sinon';
import {mount, shallow} from 'enzyme';

const props = {
  fields:       {
    referenceNum: 'Yow',
    dateFrom:     null,
    dateTo:       null,
    email:       null
  },
  handleSubmit: sinon.spy(),
  resetForm:    sinon.spy()
}

describe('(Component) LookupForm', () => {
  it('should exist', () => {
    expect(LookupForm).to.not.be.null
  })

  it('allows us to set props', () => {
    //sinon.spy(Lookup.prototype, 'componentDidMount');
    //const wrapper = mount(<LookupForm {...props} />)
    //expect(Lookup.prototype.componentDidMount.calledOnce).to.be.true
    //expect(wrapper.props().fields.referenceNum).to.equal('Yow')
    //wrapper.setProps({ fields: { referenceNum: 'Yowsa' } });
    //expect(wrapper.props().fields.referenceNum).to.equal('Yowsa')
  })

  // To test redux-forms, see: https://gist.github.com/andrewmclagan/e25983ebda4e49ed28103839ee00b839
  //
  //it('Simulate wisdom', () => {
  //  const wrapper = shallow(<Lookup {...props} />)
  //  wrapper.find('.wisdom').simulate('click')
  //  expect(initialProps.fetchZen.calledOnce).to.be.true
  //})
  //
  //it('Simulate save', () => {
  //  const wrapper = shallow(<Lookup {...props} />)
  //  wrapper.find('.save').simulate('click')
  //  expect(initialProps.saveCurrentZen.calledOnce).to.be.true
  //})
  //
  //it('List populated', () => {
  //  const wrapper = shallow(<Lookup {...props} />)
  //  wrapper.find('li').forEach(function (node) {
  //    expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
  //  })
  //})
})

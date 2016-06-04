import React from 'react'
import Zen from 'routes/Zen/components/Zen'
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';

const props = {
  zen: { id: 0, value: 'Yow' },
  saved: [{ id: 0, value: 'Yow' }, { id: 1, value: 'Yowsa' }],
  fetchZen: sinon.spy(),
  saveCurrentZen: sinon.spy()
}

describe('(Component) Zen', () => {
  it('should exist', () => {
    expect(Zen).to.not.be.null
  })

  it('allows us to set props', () => {
    //sinon.spy(Zen.prototype, 'componentDidMount');
    const wrapper = mount(<Zen {...props} />)
    //expect(Zen.prototype.componentDidMount.calledOnce).to.be.true
    expect(wrapper.props().zen.value).to.equal('Yow')
    wrapper.setProps({ zen:  { id: 0, value: 'Yowsa' } });
    expect(wrapper.props().zen.value).to.equal('Yowsa')
  })

  it('Simulate wisdom', () => {
    const wrapper = shallow(<Zen {...props} />)
    wrapper.find('.wisdom').simulate('click')
    expect(props.fetchZen.calledOnce).to.be.true
  })

  it('Simulate save', () => {
    const wrapper = shallow(<Zen {...props} />)
    wrapper.find('.save').simulate('click')
    expect(props.saveCurrentZen.calledOnce).to.be.true
  })

  it('List populated', () => {
    const wrapper = shallow(<Zen {...props} />)
    wrapper.find('li').forEach(function (node) {
      expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
    });
  })
})

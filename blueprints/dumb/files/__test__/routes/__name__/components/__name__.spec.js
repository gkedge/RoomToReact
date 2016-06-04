import React from 'react'
import <%= pascalEntityName %> from 'routes/<%= pascalEntityName %>/components/<%= pascalEntityName %>'

describe('(Component) <%= pascalEntityName %>', () => {
  it('should exist', () => {
    expect(<%= pascalEntityName %>).to.not.be.null
  })

  it('allows us to set props', () => {
    //sinon.spy(<%= pascalEntityName %>.prototype, 'componentDidMount');
    const wrapper = mount(<<%= pascalEntityName %> {...props} />)
    //expect(<%= pascalEntityName %>.prototype.componentDidMount.calledOnce).to.be.true
    expect(wrapper.props().<%= camelEntityName %>.value).to.equal('Yow')
    wrapper.setProps({ <%= camelEntityName %>: { <%= camelEntityName %>:  { id: 0, value: 'Yowsa' }  });
    expect(wrapper.props().<%= camelEntityName %>.value).to.equal('Yowsa')
  })

  it('Simulate wisdom', () => {
    const wrapper = shallow(<<%= pascalEntityName %> {...props} />)
    wrapper.find('.wisdom').simulate('click')
    expect(initialProps.fetchZen.calledOnce).to.be.true
  })

  it('Simulate save', () => {
    const wrapper = shallow(<<%= pascalEntityName %> {...props} />)
    wrapper.find('.save').simulate('click')
    expect(initialProps.saveCurrentZen.calledOnce).to.be.true
  })

  it('List populated', () => {
    const wrapper = shallow(<<%= pascalEntityName %> {...props} />)
    wrapper.find('li').forEach(function (node) {
      expect(node.text()).to.be.oneOf(['Yow', 'Yowsa']);
    })
  })
})

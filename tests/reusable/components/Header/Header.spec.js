import React from 'react'
import Header from 'reusable/components/Header'
import classes from 'reusable/components/Header/Header.scss'
import { IndexLink, Link } from 'react-router'
import { shallow } from 'enzyme'

describe('(Component) Header', () => {
  let _wrapper

  beforeEach(() => {
    _wrapper = shallow(<Header/>)
  })

  it('Renders a welcome message', () => {
    const welcome = _wrapper.find('h1')
    expect(welcome).to.exist
    expect(welcome.text()).to.match(/FPNG Refunds/)
  })

  describe('Navigation links...', () => {

    it('Should render an IndexLink to Home route', () => {
      expect(_wrapper.contains(
        <IndexLink activeClassName={classes.activeRoute} to='/'>
          Home
        </IndexLink>
      )).to.be.true
    })

    it('Should render a Link to RequestRefund route', () => {
      expect(_wrapper.contains(
        <Link activeClassName={classes.activeRoute} to='/load'>
          Refund Request
        </Link>
      )).to.be.true
    })
  })
})

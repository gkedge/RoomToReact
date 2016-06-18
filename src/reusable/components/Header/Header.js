import React from 'react'
import { IndexLink, Link } from 'react-router'
import classes from './Header.scss'

// {' · '}
// <Link to='/counter' activeClassName={classes.activeRoute}>
//  Counter
// </Link>
// {' · '}
// <Link to='/zen' activeClassName={classes.activeRoute}>
//  Zen
// </Link>
export const Header = () => (
  <div className='text-center'>
    <h1>FPNG Refunds</h1>
    <IndexLink to='/' activeClassName={classes.activeRoute}>
      Home
    </IndexLink>
    {' · '}
    <Link to='/load' activeClassName={classes.activeRoute}>
      Load Refund Request
    </Link>
  </div>
)

export default Header

import React from 'react'
import USPTOSeal from '../assets/USPTO_Seal.png'
import classes from './HomeView.scss'

export const HomeView = () => (
  <div>
    <h4>Welcome!</h4>
    <img
      alt='United States Patent and Trademark Office Seal'
      className={classes.usptoSeal}
      src={USPTOSeal} />
  </div>
)

export default HomeView

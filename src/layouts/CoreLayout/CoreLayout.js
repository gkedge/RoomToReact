/* @flow */

import React from 'react'
import Header from 'reusable/components/Header'
import classes from './CoreLayout.scss'
import '../../styles/core.scss'

/*eslint-disable flowtype/require-parameter-type*/

export const CoreLayout = ({children}):Object => (
  <div>
    <Header />
    <section className='{classes.mainContainer}'>
      {children}
    </section>
  </div>
)

CoreLayout.propTypes = {
  children: React.PropTypes.element.isRequired
}

export default CoreLayout

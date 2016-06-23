import React from 'react'
import USPTOSeal from '../assets/USPTO_Seal.png'
import { Center } from 'react-layout-components'
import classes from './HomeView.scss'

export const HomeView = () => (
  <section>
    <Center>
      <div className='uspto-seal-panel {classes.usptoSealPanel}'>
        <img
          alt='United States Patent and Trademark Office Seal'
          className='uspto-seal {classes.usptoSeal}'
          src={USPTOSeal} />
      </div>
    </Center>
  </section>
)
HomeView.displayName = 'HomeView'
export default HomeView

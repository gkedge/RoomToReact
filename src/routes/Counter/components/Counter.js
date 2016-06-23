/* @flow */

import React from 'react'
import classes from './Counter.scss'

type PropType = {
  counter: number,
  doubleAsync: Function,
  increment: Function
}

export const Counter = (props:PropType):Object => (
  <div>
    <h2 className={classes.counterContainer}>
      Counter:
      {' '}
      <span className={classes['counter--green']}>
        {props.counter}
      </span>
    </h2>
    <button className='btn btn-default' onClick={props.increment}>
      Increment
    </button>
    {' '}
    <button className='btn btn-default' onClick={props.doubleAsync}>
      Double (Async)
    </button>
  </div>
)

Counter.displayName = 'Counter'
Counter.propTypes = {
  counter:     React.PropTypes.number.isRequired,
  doubleAsync: React.PropTypes.func.isRequired,
  increment:   React.PropTypes.func.isRequired
}

export default Counter

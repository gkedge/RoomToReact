/* @flow */

/*eslint no-useless-constructor: 0*/

import React from 'react'
import classes from './Zen.scss'

import type {ZenObject} from '../interfaces/zen'

type Props = {
  zen: ?ZenObject,
  saved: Array < ZenObject >,
  fetchZen: Function,
  saveCurrentZen: Function
}

export class Zen extends React.Component {

  constructor(props:Props) {
    super(props)
  }

  render():Object {
    const {zen, ...props} = this.props
    return (
      <div>
        <div>
          <h2 className={classes.zenHeader}>
            {zen ? zen.value : ''}
          </h2>
          <button className='btn wisdom' onClick={props.fetchZen}>
            Fetch a wisdom
          </button>
          {' '}
          <button className='btn save' onClick={props.saveCurrentZen}>
            Save
          </button>
        </div>
        {
          props.saved.length
            ? <div className={classes.savedWisdoms}>
              <h3>
                Saved wisdoms
              </h3>
              <ul>
                {this.props.saved.map(z =>
                  <li key={z.id}>
                    {z.value}
                  </li>
                )}
              </ul>
            </div>
            : null
        }
      </div>
    )
  }
}

Zen.displayName = 'Zen'
Zen.propTypes = {
  zen:            React.PropTypes.object,
  saved:          React.PropTypes.array.isRequired,
  fetchZen:       React.PropTypes.func.isRequired,
  saveCurrentZen: React.PropTypes.func.isRequired
}

export default Zen


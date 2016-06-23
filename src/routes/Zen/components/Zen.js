/* @flow */

/*eslint no-useless-constructor: 0*/

import React from 'react'
import classes from './Zen.scss'

import type {ZenObjectType} from '../interfaces/zen'

type PropType = {
  zen: ?ZenObjectType,
  saved: Array < ZenObjectType >,
  fetchZen: Function,
  saveCurrentZen: Function
}

export class Zen extends React.Component {

  constructor(props:PropType) {
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
                {this.props.saved.map((z:ZenObjectType):Object =>
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
  fetchZen:       React.PropTypes.func.isRequired,
  saveCurrentZen: React.PropTypes.func.isRequired,
  saved:          React.PropTypes.array.isRequired,
  zen:            React.PropTypes.object
}

export default Zen


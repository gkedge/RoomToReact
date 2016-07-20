/* @flow */
import type {
  MapToObjectType
} from 'reusable/interfaces/FpngTypes'
import type { ZenStateObjectType } from '../interfaces/zen'

import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../modules/zen'

import Zen from '../components/Zen'

const mapStateToProps = (state:ZenStateObjectType):MapToObjectType => ({
  zen:   state.zen.zens.find((zen:Zen):Zen => zen.id === state.zen.current),
  saved: state.zen.zens.filter((zen:Zen):boolean => state.zen.saved.indexOf(zen.id) !== -1)
})

const mapActionCreators: {fetchZen: Function, saveCurrentZen: Function} = {
  fetchZen,
  saveCurrentZen
}

export default connect(mapStateToProps, mapActionCreators)(Zen)

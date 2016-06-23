/* @flow */
import type { ZenObjectType, ZenStateObjectType } from '../interfaces/zen'

import { connect } from 'react-redux'
import { fetchZen, saveCurrentZen } from '../modules/zen'

import Zen from '../components/Zen'

/* TODO: Return type? { zen: ?ZenObjectType, saved: ?Array<ZenObjectType> } */
const mapStateToProps = (state:ZenStateObjectType):Object => ({
  zen:   state.zen.zens.find((zen:Zen):Zen => zen.id === state.zen.current),
  saved: state.zen.zens.filter((zen:Zen):boolean => state.zen.saved.indexOf(zen.id) !== -1)
})

const mapActionCreators: {fetchZen: Function, saveCurrentZen: Function} = {
  fetchZen,
  saveCurrentZen
}

export default connect(mapStateToProps, mapActionCreators)(Zen)

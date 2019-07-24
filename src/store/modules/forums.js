import {appendChildToParentMutation} from '../assetHelpers'

export default {
  namespaced: true,

  state: {
    items: {}
  },

  getters: {
  },

  actions: {
    fetchForum: ({dispatch}, {id}) => dispatch('fetchResource', {resourceName: 'forums', id: id}, {root: true}),
    fetchForums: ({dispatch}, {ids}) => dispatch('fetchResources', {resourceName: 'forums', ids: ids}, {root: true})
  },

  mutations: {
    appendThreadToForum: appendChildToParentMutation({
      childName: 'threads',
      parentName: 'forums'
    })
  }
}

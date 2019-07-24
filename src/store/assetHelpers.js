import Vue from 'vue'

export const appendChildToParentMutation = ({childName, parentName}) => {
  return (state, {childId, parentId}) => {
    const parent = state.items[parentId]
    if (!parent[childName]) {
      Vue.set(parent, childName, {})
    }
    Vue.set(parent[childName], childId, childId)
  }
}

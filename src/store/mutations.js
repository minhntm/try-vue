import Vue from 'vue'

export default {
  setResource (state, {resource, id, resourceName}) {
    resource['.key'] = id
    Vue.set(state[resourceName].items, id, resource)
  }
}
